import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'guiagentpro'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeScreenUnderstanding(data: any) {
  const benchmarks = data.benchmarks || []
  if (benchmarks.length === 0) return { total: 0, avgScore: 0, recommendation: '无基准测试数据' }
  const avgScore = benchmarks.reduce((a: number, b: any) => a + (b.score || 0), 0) / benchmarks.length
  const byType: Record<string, number> = {}
  for (const b of benchmarks) { byType[b.type || 'unknown'] = (byType[b.type || 'unknown'] || 0) + 1 }
  return { total: benchmarks.length, avgScore: avgScore.toFixed(1), byType, recommendation: avgScore > 80 ? '屏幕理解能力优秀' : avgScore > 60 ? '中等水平，建议增强视觉模型' : '需大幅提升视觉理解能力' }
}
function formatScreenUnderstanding(r: any) {
  return `# 屏幕理解能力评估
📊 基准测试: ${r.total} | 平均分: ${r.avgScore}/100
## 测试类型
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}项`).join('\n')}
💡 ${r.recommendation}
---
💡 对标Qwen-UI-Agent：GUI智能体核心能力是理解屏幕元素并准确定位操作目标。`
}
function analyzeClickAutomation(data: any) {
  const tasks = data.automationTasks || []
  if (tasks.length === 0) return { total: 0, success: 0, successRate: '0', recommendation: '无自动化任务数据' }
  const success = tasks.filter((t: any) => t.status === 'success').length
  const avgSteps = tasks.reduce((a: number, t: any) => a + (t.steps || 5), 0) / tasks.length
  const successRate = ((success / tasks.length) * 100).toFixed(1)
  return { total: tasks.length, success, avgSteps: avgSteps.toFixed(1), successRate, recommendation: parseFloat(successRate) > 85 ? '点击自动化成功率良好' : '需优化元素定位与操作序列' }
}
function formatClickAutomation(r: any) {
  return `# 点击自动化执行
📊 任务: ${r.total} | 成功: ${r.success} | 成功率: ${r.successRate}% | 平均步数: ${r.avgSteps}
💡 ${r.recommendation}
---
💡 GUI Agent核心：从"看懂屏幕"到"精准操作"，每一步点击都需要亚像素级定位精度。`
}
function analyzeCrossAppWorkflow(data: any) {
  const workflows = data.workflows || []
  if (workflows.length === 0) return { total: 0, crossApp: 0, recommendation: '无跨应用工作流' }
  const crossApp = workflows.filter((w: any) => (w.appCount || 1) > 1).length
  const avgApps = workflows.reduce((a: number, w: any) => a + (w.appCount || 1), 0) / workflows.length
  return { total: workflows.length, crossApp, avgApps: avgApps.toFixed(1), crossAppRate: ((crossApp / workflows.length) * 100).toFixed(0), recommendation: crossApp > 0 ? `跨应用工作流${crossApp}个，平均${avgApps.toFixed(1)}个应用` : '建议设计跨应用自动化场景' }
}
function formatCrossAppWorkflow(r: any) {
  return `# 跨应用工作流
📊 工作流: ${r.total} | 跨应用: ${r.crossApp} | 跨应用率: ${r.crossAppRate}% | 平均应用数: ${r.avgApps}
💡 ${r.recommendation}
---
💡 对标RPA 2.0：GUI Agent让跨应用自动化从"录制回放"进化为"理解+推理+执行"。`
}
function analyzeElementDetection(data: any) {
  const elements = data.detectedElements || []
  if (elements.length === 0) return { total: 0, accuracy: '0', recommendation: '无元素检测数据' }
  const correct = elements.filter((e: any) => e.correct).length
  const accuracy = ((correct / elements.length) * 100).toFixed(1)
  const byType: Record<string, number> = {}
  for (const e of elements) { byType[e.type || 'unknown'] = (byType[e.type || 'unknown'] || 0) + 1 }
  return { total: elements.length, correct, accuracy, byType, recommendation: parseFloat(accuracy) > 90 ? '元素检测精度优秀' : '建议增强目标检测模型' }
}
function formatElementDetection(r: any) {
  return `# UI元素检测精度
📊 检测元素: ${r.total} | 正确: ${r.correct} | 精度: ${r.accuracy}%
## 元素类型
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}个`).join('\n')}
💡 ${r.recommendation}
---
💡 视觉定位（Visual Grounding）是GUI Agent的基础能力，直接影响操作成功率。`
}
function analyzeTaskPlanning(data: any) {
  const plans = data.taskPlans || []
  if (plans.length === 0) return { total: 0, completed: 0, recommendation: '无任务规划数据' }
  const completed = plans.filter((p: any) => p.status === 'completed').length
  const avgSubtasks = plans.reduce((a: number, p: any) => a + (p.subtasks || 3), 0) / plans.length
  const completionRate = ((completed / plans.length) * 100).toFixed(1)
  return { total: plans.length, completed, avgSubtasks: avgSubtasks.toFixed(1), completionRate, recommendation: parseFloat(completionRate) > 80 ? '任务规划完成率高' : '建议增强任务分解与规划能力' }
}
function formatTaskPlanning(r: any) {
  return `# 任务规划与分解
📊 规划任务: ${r.total} | 完成: ${r.completed} | 完成率: ${r.completionRate}% | 平均子任务: ${r.avgSubtasks}
💡 ${r.recommendation}
---
💡 GUI Agent规划能力：将复杂目标分解为可执行的子任务序列，是通用Agent的核心。`
}
function analyzeErrorRecovery(data: any) {
  const errors = data.errorLogs || []
  if (errors.length === 0) return { total: 0, recovered: 0, recommendation: '无错误记录' }
  const recovered = errors.filter((e: any) => e.recovered).length
  const recoveryRate = ((recovered / errors.length) * 100).toFixed(1)
  const byType: Record<string, number> = {}
  for (const e of errors) { byType[e.type || 'unknown'] = (byType[e.type || 'unknown'] || 0) + 1 }
  return { total: errors.length, recovered, recoveryRate, byType, recommendation: parseFloat(recoveryRate) > 70 ? '错误恢复能力良好' : '建议增强异常处理与自我修复' }
}
function formatErrorRecovery(r: any) {
  return `# 错误恢复与自我修复
📊 错误: ${r.total} | 已恢复: ${r.recovered} | 恢复率: ${r.recoveryRate}%
## 错误类型
${Object.entries(r.byType).map(([k, v]: any) => `- ${k}: ${v}次`).join('\n')}
💡 ${r.recommendation}
---
💡 GUI Agent鲁棒性：面对UI变化/弹窗/加载延迟，自我修复能力决定自动化可靠性。`
}
function analyzePlatformCoverage(data: any) {
  const platforms = data.platforms || []
  const defaultPlatforms = [
    { name: 'Web浏览器', supported: true, coverage: 95 },
    { name: 'Windows桌面', supported: true, coverage: 88 },
    { name: 'macOS桌面', supported: true, coverage: 85 },
    { name: 'Android手机', supported: true, coverage: 80 },
    { name: 'iOS手机', supported: false, coverage: 60 },
    { name: 'Linux桌面', supported: false, coverage: 50 }
  ]
  const result = platforms.length > 0 ? platforms : defaultPlatforms
  const supported = result.filter((p: any) => p.supported).length
  const avgCoverage = result.reduce((a: number, p: any) => a + (p.coverage || 0), 0) / result.length
  return { platforms: result, supported, total: result.length, avgCoverage: avgCoverage.toFixed(0), recommendation: supported < 4 ? '建议扩展平台覆盖' : '平台覆盖良好' }
}
function formatPlatformCoverage(r: any) {
  return `# 平台覆盖度
📊 支持平台: ${r.supported}/${r.total} | 平均覆盖率: ${r.avgCoverage}%
${r.platforms.map((p: any) => `- ${p.name}: ${p.supported ? '✅' : '❌'} ${p.coverage}%`).join('\n')}
💡 ${r.recommendation}
---
💡 对标Qwen-UI-Agent：覆盖手机/电脑/网页/深度搜索，全平台通用GUI智能体是终极目标。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'screen_understanding_evaluator',
    description: '屏幕理解能力评估：基准测试分数、测试类型分布，对标Qwen-UI-Agent',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"benchmarks":[{"name":"WebArena","type":"web","score":88},{"name":"AndroidControl","type":"mobile","score":82}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatScreenUnderstanding(analyzeScreenUnderstanding(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'click_automation_tracker',
    description: '点击自动化执行追踪：成功率、平均步数、任务完成质量',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"automationTasks":[{"name":"登录流程","status":"success","steps":8}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatClickAutomation(analyzeClickAutomation(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'cross_app_workflow_analyzer',
    description: '跨应用工作流分析：跨应用率、平均应用数、工作流复杂度',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"workflows":[{"name":"报销流程","appCount":3,"status":"active"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCrossAppWorkflow(analyzeCrossAppWorkflow(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'element_detection_evaluator',
    description: 'UI元素检测精度评估：检测正确率、元素类型分布',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"detectedElements":[{"type":"button","correct":true},{"type":"input","correct":false}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatElementDetection(analyzeElementDetection(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'task_planning_evaluator',
    description: '任务规划与分解评估：完成率、平均子任务数、规划质量',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"taskPlans":[{"name":"预订机票","subtasks":5,"status":"completed"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTaskPlanning(analyzeTaskPlanning(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'error_recovery_assessor',
    description: '错误恢复与自我修复评估：恢复率、错误类型分布、鲁棒性建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"errorLogs":[{"type":"element_not_found","recovered":true},{"type":"timeout","recovered":false}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatErrorRecovery(analyzeErrorRecovery(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'platform_coverage_mapper',
    description: '平台覆盖度映射：Web/Windows/macOS/Android/iOS/Linux六平台支持状态',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"platforms":[{"name":"Web浏览器","supported":true,"coverage":95}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPlatformCoverage(analyzePlatformCoverage(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'visual_grounding_validator',
    description: '视觉定位验证：验证Agent能否准确识别和定位屏幕上的UI元素，输出定位精度热力',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"groundingTests":[{"element":"登录按钮","expectedX":500,"expectedY":300,"actualX":505,"actualY":298,"imageWidth":1920,"imageHeight":1080}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const tests = d.groundingTests || []
      let totalError = 0, passed = 0
      const report = tests.map((t: any) => {
        const dx = (t.actualX || 0) - (t.expectedX || 0)
        const dy = (t.actualY || 0) - (t.expectedY || 0)
        const error = Math.sqrt(dx * dx + dy * dy)
        totalError += error
        if (error < 10) passed++
        return `- ${t.element}: 偏差${error.toFixed(1)}px ${error < 10 ? '✅' : '⚠️'}`
      }).join('\n')
      const avgError = tests.length > 0 ? (totalError / tests.length).toFixed(1) : '0'
      return `# 视觉定位验证（Visual Grounding）
📊 测试: ${tests.length} | 精准定位: ${passed} | 平均偏差: ${avgError}px
## 各元素定位精度
${report || '无数据'}
💡 ${parseFloat(avgError) < 5 ? '定位精度优秀，可进入生产部署' : '定位偏差偏大，建议优化视觉模型'}
---
💡 对标Qwen-UI-Agent：亚像素级定位精度是GUI Agent可靠操作的基石。`
    }
  }))
}
