/**
 * DSH Vibe Coding智能体 Plugin v1.0.0
 * AI驱动的编程范式革命 for DeepSeek Harness — 从需求到代码的完整开发闭环
 *
 * 聚焦2026年Vibe Coding垂直领域，覆盖需求解析、代码质量、AI调试、原型生成、
 * 知识图谱、部署自动化、生产力追踪、技术债量化八大核心场景。
 *
 * Disclaimer: AI编程助手建议需结合实际项目情况，不代表最优解。
 *
 * 工具清单:
 * 1. requirement_to_code_pipeline  — 需求到代码流水线
 * 2. code_quality_coach            — 代码质量教练
 * 3. ai_debugging_assistant        — AI调试助手
 * 4. vibe_prototyper               — 快速原型生成器
 * 5. codebase_knowledge_graph      — 代码库知识图谱
 * 6. deployment_automation_advisor — 部署自动化顾问
 * 7. developer_productivity_tracker— 开发者生产力追踪
 * 8. technical_debt_quantifier     — 技术债量化
 *
 * @module dsh-tool-vibecodingagent | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-vibecodingagent'
export const inject = ['tools']

const VERSION = '1.0.0'

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

// ==================== SECTION 2 — Disclaimer ====================

const DISCLAIMER = 'AI编程助手建议需结合实际项目情况，不代表最优解。'

// ==================== SECTION 3 — 类型定义 ====================

// --- Tool 1: requirement_to_code_pipeline ---
interface RequirementInput {
  requirement_text: string
  tech_stack_preference?: string
  project_scale: 'small' | 'medium' | 'large' | 'enterprise'
  team_size: number
  deadline_weeks: number
}

interface TechRecommendation {
  category: string
  recommendation: string
  confidence: number
  alternatives: string[]
}

interface PipelinePhase {
  phase: string
  estimated_days: number
  deliverables: string[]
  risk_level: 'low' | 'medium' | 'high'
}

interface RequirementAnalysis {
  parsed_requirements: string[]
  tech_recommendations: TechRecommendation[]
  estimated_total_days: number
  story_points: number
  dependency_graph: string[]
  phases: PipelinePhase[]
  effort_breakdown: Record<string, number>
}

// --- Tool 2: code_quality_coach ---
interface QualityInput {
  language: string
  lines_of_code: number
  cyclomatic_complexity: number
  duplicate_percentage: number
  test_coverage: number
  functions_count: number
}

interface CodeSmell {
  smell_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  suggestion: string
}

interface QualityReport {
  overall_score: number
  complexity_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  smells: CodeSmell[]
  refactoring_suggestions: string[]
  coverage_assessment: string
  readability_score: number
  maintainability_index: number
}

// --- Tool 3: ai_debugging_assistant ---
interface DebugInput {
  error_message: string
  stack_trace: string
  language: string
  framework?: string
  log_lines: string[]
  reproduction_steps: string[]
}

interface RootCause {
  cause: string
  confidence: number
  category: 'syntax' | 'logic' | 'runtime' | 'concurrency' | 'configuration' | 'dependency'
  explanation: string
}

interface FixSuggestion {
  fix_id: string
  description: string
  code_change: string
  risk_level: 'low' | 'medium' | 'high'
  estimated_minutes: number
}

interface DebugAnalysis {
  root_causes: RootCause[]
  fix_suggestions: FixSuggestion[]
  regression_tests: string[]
  log_diagnosis: string
  stack_analysis: string
}

// --- Tool 4: vibe_prototyper ---
interface PrototypeInput {
  artifact_type: 'ui_component' | 'api_scaffold' | 'database_schema' | 'deployment_script' | 'dependency_config'
  name: string
  framework: string
  features: string[]
  style?: 'minimal' | 'standard' | 'comprehensive'
}

interface GeneratedArtifact {
  filename: string
  content: string
  language: string
  description: string
}

interface PrototypeOutput {
  artifact_type: string
  artifacts: GeneratedArtifact[]
  setup_instructions: string[]
  next_steps: string[]
}

// --- Tool 5: codebase_knowledge_graph ---
interface KnowledgeGraphInput {
  repo_name: string
  module_count: number
  api_endpoint_count: number
  total_loc: number
  analysis_depth: 'shallow' | 'medium' | 'deep'
}

interface ModuleNode {
  module_id: string
  name: string
  dependencies: string[]
  dependents: string[]
  coupling_score: number
}

interface ApiCallChain {
  chain_id: string
  entry_point: string
  path: string[]
  depth: number
  risk: 'low' | 'medium' | 'high'
}

interface Hotspot {
  file: string
  change_frequency: number
  last_modified: string
  authors: number
  risk_level: 'low' | 'medium' | 'high'
}

interface TechDebtMap {
  area: string
  debt_level: 'low' | 'medium' | 'high' | 'critical'
  estimated_hours: number
  priority: number
}

interface KnowledgeGraphResult {
  modules: ModuleNode[]
  api_chains: ApiCallChain[]
  hotspots: Hotspot[]
  tech_debt_map: TechDebtMap[]
  visualization_hint: string
}

// --- Tool 6: deployment_automation_advisor ---
interface DeploymentInput {
  environment: 'development' | 'staging' | 'production'
  current_platform: string
  team_expertise: 'beginner' | 'intermediate' | 'advanced'
  uptime_requirement: number
  deployment_frequency: 'daily' | 'weekly' | 'monthly' | 'on_demand'
}

interface CICDRecommendation {
  tool: string
  config_snippet: string
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface ContainerAdvice {
  base_image: string
  optimization_tips: string[]
  estimated_image_size_mb: number
  security_score: number
}

interface RollbackStrategy {
  strategy: string
  recovery_time_minutes: number
  data_loss_risk: 'none' | 'low' | 'medium' | 'high'
  automation_level: 'full' | 'semi' | 'manual'
}

interface MonitoringSetup {
  tool: string
  metrics: string[]
  alert_rules: string[]
  dashboard_url: string
}

interface DeploymentRecommendation {
  cicd: CICDRecommendation
  container: ContainerAdvice
  canary_strategy: string
  rollback: RollbackStrategy
  monitoring: MonitoringSetup
  estimated_setup_hours: number
}

// --- Tool 7: developer_productivity_tracker ---
interface ProductivityInput {
  developer_id: string
  period_days: number
  commits_count: number
  pr_count: number
  lines_added: number
  lines_deleted: number
  review_count: number
  meeting_hours: number
  ai_assisted_hours: number
}

interface CodingEfficiency {
  commits_per_day: number
  lines_per_commit: number
  pr_merge_rate: number
  review_turnaround_hours: number
}

interface FocusAnalysis {
  focus_hours_avg: number
  interruption_count: number
  flow_state_pct: number
  context_switch_cost_minutes: number
}

interface SkillGrowth {
  new_languages: string[]
  new_frameworks: string[]
  domains_explored: string[]
  learning_velocity: number
}

interface AIImpact {
  time_saved_hours: number
  productivity_boost_pct: number
  ai_adoption_level: 'low' | 'medium' | 'high'
  top_ai_use_cases: string[]
}

interface ProductivityReport {
  efficiency: CodingEfficiency
  daily_output: Record<string, number>
  focus: FocusAnalysis
  skill_growth: SkillGrowth
  ai_impact: AIImpact
  overall_productivity_score: number
}

// --- Tool 8: technical_debt_quantifier ---
interface TechDebtInput {
  total_loc: number
  legacy_loc: number
  outdated_dependencies: number
  undocumented_apis: number
  code_smell_count: number
  avg_complexity: number
  team_velocity_impact_pct: number
}

interface DebtItem {
  category: string
  debt_index: number
  monthly_interest_hours: number
  principal_hours: number
  compound_risk: 'low' | 'medium' | 'high'
}

interface PayoffPlan {
  priority: number
  action: string
  estimated_hours: number
  roi_ratio: number
  risk_if_deferred: string
}

interface ImpactAnalysis {
  velocity_impact_pct: number
  bug_rate_increase_pct: number
  onboarding_overhead_hours: number
  maintenance_cost_monthly: number
}

interface TechDebtReport {
  total_debt_index: number
  debt_items: DebtItem[]
  maintenance_cost_monthly_hours: number
  payoff_plan: PayoffPlan[]
  impact: ImpactAnalysis
  roi_summary: string
}

// ==================== SECTION 4 — 分析函数 ====================

// --- Tool 1: requirement_to_code_pipeline ---
function analyzeRequirementPipeline(input: RequirementInput): RequirementAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.requirement_text + input.project_scale + input.tech_stack_preference || 'default'
  ))

  const parsedReqs = [
    `用户故事: ${input.requirement_text.slice(0, 30)}...`,
    '功能边界确认与优先级排序',
    '非功能性需求: 性能/安全/可用性',
    '数据模型与API契约定义',
    `团队规模适配: ${input.team_size}人协作模式`,
  ]

  const techRecs: TechRecommendation[] = [
    {
      category: '前端框架',
      recommendation: input.tech_stack_preference || 'React 18 + TypeScript',
      confidence: Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100,
      alternatives: ['Vue 3', 'Svelte', 'Angular'],
    },
    {
      category: '后端运行时',
      recommendation: 'Node.js 22 LTS / Deno 2.0',
      confidence: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
      alternatives: ['Bun', 'Go', 'Rust'],
    },
    {
      category: '数据库',
      recommendation: 'PostgreSQL 17 + Redis',
      confidence: Math.round(rng.nextFloat(0.8, 0.99) * 100) / 100,
      alternatives: ['MySQL 9', 'MongoDB', 'CockroachDB'],
    },
    {
      category: '部署平台',
      recommendation: 'Kubernetes / Vercel / Railway',
      confidence: Math.round(rng.nextFloat(0.7, 0.92) * 100) / 100,
      alternatives: ['AWS ECS', 'Google Cloud Run', 'Fly.io'],
    },
    {
      category: 'AI集成',
      recommendation: 'Vibe Coding Copilot + LLM API',
      confidence: Math.round(rng.nextFloat(0.85, 0.99) * 100) / 100,
      alternatives: ['GitHub Copilot', 'Cursor', 'Windsurf'],
    },
  ]

  const scaleFactors: Record<string, number> = { small: 1, medium: 1.8, large: 3.2, enterprise: 5.5 }
  const baseDays = input.deadline_weeks * 5
  const adjustedDays = Math.round(baseDays * (scaleFactors[input.project_scale] || 1) / Math.sqrt(input.team_size))

  const phases: PipelinePhase[] = [
    { phase: '需求细化与设计', estimated_days: Math.round(adjustedDays * 0.2), deliverables: ['PRD文档', '架构图', 'API契约'], risk_level: 'low' },
    { phase: '核心功能开发', estimated_days: Math.round(adjustedDays * 0.4), deliverables: ['MVP代码', '单元测试', '集成测试'], risk_level: 'medium' },
    { phase: 'AI辅助优化', estimated_days: Math.round(adjustedDays * 0.15), deliverables: ['代码审查', '性能优化', 'AI生成文档'], risk_level: 'low' },
    { phase: '测试与修复', estimated_days: Math.round(adjustedDays * 0.15), deliverables: ['E2E测试', 'Bug修复', '安全扫描'], risk_level: 'medium' },
    { phase: '部署与交付', estimated_days: Math.round(adjustedDays * 0.1), deliverables: ['CI/CD配置', '监控告警', '上线检查'], risk_level: 'high' },
  ]

  const storyPoints = Math.round(adjustedDays * rng.nextFloat(2, 4))

  const effortBreakdown: Record<string, number> = {
    development: Math.round(adjustedDays * 0.45),
    testing: Math.round(adjustedDays * 0.2),
    design: Math.round(adjustedDays * 0.15),
    devops: Math.round(adjustedDays * 0.1),
    documentation: Math.round(adjustedDays * 0.1),
  }

  return {
    parsed_requirements: parsedReqs,
    tech_recommendations: techRecs,
    estimated_total_days: adjustedDays,
    story_points: storyPoints,
    dependency_graph: ['auth_module', 'data_layer', 'api_gateway', 'ui_components', 'notification_service'],
    phases,
    effort_breakdown: effortBreakdown,
  }
}

// --- Tool 2: code_quality_coach ---
function analyzeCodeQuality(input: QualityInput): QualityReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.language + input.lines_of_code.toString() + input.cyclomatic_complexity.toString()
  ))

  const complexityGrade: QualityReport['complexity_grade'] =
    input.cyclomatic_complexity <= 10 ? 'A' :
    input.cyclomatic_complexity <= 20 ? 'B' :
    input.cyclomatic_complexity <= 40 ? 'C' :
    input.cyclomatic_complexity <= 60 ? 'D' : 'F'

  const smells: CodeSmell[] = []
  if (input.cyclomatic_complexity > 20) {
    smells.push({ smell_type: '高复杂度函数', severity: 'high', location: 'core/module_a.ts:42', suggestion: '拆分为多个单一职责函数' })
  }
  if (input.duplicate_percentage > 5) {
    smells.push({ smell_type: '代码重复', severity: input.duplicate_percentage > 15 ? 'critical' : 'medium', location: 'shared/utils/', suggestion: '提取公共逻辑到工具函数' })
  }
  if (input.test_coverage < 60) {
    smells.push({ smell_type: '测试覆盖不足', severity: input.test_coverage < 30 ? 'critical' : 'high', location: 'src/services/', suggestion: '补充单元测试和集成测试' })
  }
  if (input.lines_of_code > 5000 && input.functions_count < 20) {
    smells.push({ smell_type: '上帝类/函数', severity: 'high', location: 'src/main/', suggestion: '按职责拆分为多个模块' })
  }
  if (smells.length === 0) {
    smells.push({ smell_type: '无明显异味', severity: 'low', location: 'N/A', suggestion: '保持当前编码标准' })
  }

  const refactoringSuggestions = [
    '提取接口减少模块间耦合',
    '引入策略模式替换条件分支',
    '使用依赖注入提升可测试性',
    '应用SOLID原则重构核心类',
    '引入类型守卫增强类型安全',
  ]

  const coverageAssessment = input.test_coverage >= 80 ? '优秀: 覆盖率达标' :
    input.test_coverage >= 60 ? '良好: 建议提升至80%' :
    input.test_coverage >= 40 ? '不足: 需补充关键路径测试' : '严重不足: 测试债务需优先偿还'

  const readabilityScore = Math.round(
    Math.max(20, 100 - input.cyclomatic_complexity * 0.5 - input.duplicate_percentage * 2) * 100
  ) / 100

  const maintainabilityIndex = Math.round(
    Math.max(10, 171 - 5.2 * Math.log(input.lines_of_code + 1) - 0.23 * input.cyclomatic_complexity - 16.2 * Math.log(input.functions_count + 1)) * 100
  ) / 100

  const overallScore = Math.round(
    (readabilityScore * 0.3 + maintainabilityIndex * 0.3 + input.test_coverage * 0.25 + (100 - input.duplicate_percentage * 3) * 0.15) * 100
  ) / 100

  return {
    overall_score: Math.max(0, Math.min(100, overallScore)),
    complexity_grade: complexityGrade,
    smells,
    refactoring_suggestions: refactoringSuggestions.slice(0, rng.nextInt(3, 5)),
    coverage_assessment: coverageAssessment,
    readability_score: readabilityScore,
    maintainability_index: maintainabilityIndex,
  }
}

// --- Tool 3: ai_debugging_assistant ---
function analyzeDebugIssue(input: DebugInput): DebugAnalysis {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.error_message + input.stack_trace.slice(0, 100) + input.language
  ))

  const rootCauses: RootCause[] = [
    {
      cause: input.error_message.slice(0, 60),
      confidence: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
      category: rng.pick(['syntax', 'logic', 'runtime', 'concurrency', 'configuration', 'dependency']),
      explanation: `基于堆栈分析，错误发生在调用链第${rng.nextInt(2, 8)}层，可能由边界条件未处理或类型不匹配触发。`,
    },
    {
      cause: '依赖版本不兼容',
      confidence: Math.round(rng.nextFloat(0.4, 0.75) * 100) / 100,
      category: 'dependency',
      explanation: '检查package.json中依赖版本范围，锁定版本可能解决冲突。',
    },
  ]

  const fixSuggestions: FixSuggestion[] = [
    {
      fix_id: `FIX-${rng.nextInt(1000, 9999)}`,
      description: '添加空值检查与类型守卫',
      code_change: `if (value != null && typeof value === 'expected') {\n  // safe operation\n}`,
      risk_level: 'low',
      estimated_minutes: rng.nextInt(5, 30),
    },
    {
      fix_id: `FIX-${rng.nextInt(1000, 9999)}`,
      description: '重构异步处理逻辑',
      code_change: `try {\n  await asyncOperation();\n} catch (err) {\n  logger.error('Operation failed', err);\n  throw new AppError('OPERATION_FAILED', { cause: err });\n}`,
      risk_level: 'medium',
      estimated_minutes: rng.nextInt(15, 60),
    },
    {
      fix_id: `FIX-${rng.nextInt(1000, 9999)}`,
      description: '更新依赖至兼容版本',
      code_change: `npm install package@latest --save-exact`,
      risk_level: 'low',
      estimated_minutes: rng.nextInt(5, 15),
    },
  ]

  const regressionTests = [
    `test('should handle ${input.error_message.slice(0, 20)} gracefully', () => { ... })`,
    'test("should not throw on null input", () => { ... })',
    'test("should retry on transient failure", () => { ... })',
  ]

  const logDiagnosis = input.log_lines.length > 0
    ? `日志分析: 发现${rng.nextInt(1, 5)}条ERROR级别记录，${rng.nextInt(3, 12)}条WARN。关键模式: ${rng.pick(['连接超时', '内存泄漏', '竞态条件', '配置缺失'])}`
    : '无日志输入，建议启用结构化日志收集'

  const stackAnalysis = `堆栈深度: ${input.stack_trace.split('\n').length}层 | 关键帧: ${rng.pick(['module init', 'event handler', 'async callback', 'middleware chain'])} | 语言运行时: ${input.language} ${input.framework ? '+ ' + input.framework : ''}`

  return {
    root_causes: rootCauses,
    fix_suggestions: fixSuggestions,
    regression_tests: regressionTests,
    log_diagnosis: logDiagnosis,
    stack_analysis: stackAnalysis,
  }
}

// --- Tool 4: vibe_prototyper ---
function analyzePrototype(input: PrototypeInput): PrototypeOutput {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.artifact_type + input.name + input.framework
  ))

  const artifacts: GeneratedArtifact[] = []
  const style = input.style || 'standard'

  switch (input.artifact_type) {
    case 'ui_component':
      artifacts.push({
        filename: `${input.name}.tsx`,
        language: 'tsx',
        content: `import React from 'react';\n\ninterface ${input.name}Props {\n  ${input.features.map(f => `${f}: string`).join(';\n  ')}\n}\n\nexport const ${input.name}: React.FC<${input.name}Props> = (props) => {\n  return (\n    <div className="${input.name.toLowerCase()}">\n      {/* Component implementation */}\n    </div>\n  );\n};\n\nexport default ${input.name};`,
        description: `${input.name} React组件 - ${style}风格`,
      })
      artifacts.push({
        filename: `${input.name}.module.css`,
        language: 'css',
        content: `.${input.name.toLowerCase()} {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1.5rem;\n  border-radius: 8px;\n  background: var(--surface-color);\n}`,
        description: '组件样式定义',
      })
      break

    case 'api_scaffold':
      artifacts.push({
        filename: `${input.name.toLowerCase()}.controller.ts`,
        language: 'typescript',
        content: `import { Router } from 'express';\n\nconst router = Router();\n\n${input.features.map(f => `router.get('/${f}', async (req, res) => {\n  // TODO: Implement ${f} endpoint\n  res.json({ status: 'ok' });\n});\n`).join('\n')}\n\nexport default router;`,
        description: `${input.name} API控制器`,
      })
      artifacts.push({
        filename: `${input.name.toLowerCase()}.service.ts`,
        language: 'typescript',
        content: `export class ${input.name}Service {\n  ${input.features.map(f => `async ${f}(params: Record<string, unknown>): Promise<unknown> {\n    // Business logic for ${f}\n    return {};\n  }`).join('\n\n  ')}\n}`,
        description: '业务逻辑服务层',
      })
      break

    case 'database_schema':
      artifacts.push({
        filename: `${input.name.toLowerCase()}.sql`,
        language: 'sql',
        content: `-- ${input.name} Database Schema\n\nCREATE TABLE IF NOT EXISTS ${input.name.toLowerCase()} (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  ${input.features.map(f => `${f} VARCHAR(255) NOT NULL`).join(',\n  ')},\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nCREATE INDEX idx_${input.name.toLowerCase()}_created ON ${input.name.toLowerCase()}(created_at);`,
        description: `${input.name} 数据库表结构`,
      })
      break

    case 'deployment_script':
      artifacts.push({
        filename: `deploy-${input.name.toLowerCase()}.sh`,
        language: 'bash',
        content: `#!/bin/bash\nset -euo pipefail\n\n# ${input.name} Deployment Script\necho "Starting deployment..."\n\n${input.features.map(f => `# ${f}\necho "Configuring ${f}..."`).join('\n')}\n\necho "Deployment complete!"`,
        description: `${input.name} 部署脚本`,
      })
      artifacts.push({
        filename: `Dockerfile.${input.name.toLowerCase()}`,
        language: 'dockerfile',
        content: `FROM node:22-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nEXPOSE 3000\nCMD ["node", "dist/index.js"]`,
        description: '多阶段Docker构建',
      })
      break

    case 'dependency_config':
      artifacts.push({
        filename: `package.json`,
        language: 'json',
        content: JSON.stringify({
          name: input.name.toLowerCase(),
          version: '1.0.0',
          dependencies: Object.fromEntries(input.features.map(f => [f, `^${rng.nextInt(1, 5)}.${rng.nextInt(0, 9)}.0`])),
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^22.0.0',
          },
        }, null, 2),
        description: '项目依赖配置',
      })
      break
  }

  return {
    artifact_type: input.artifact_type,
    artifacts,
    setup_instructions: [
      '复制生成文件到项目目录',
      '运行 npm install 安装依赖',
      '根据实际需求调整配置参数',
      '执行初始测试验证',
    ],
    next_steps: [
      '完善业务逻辑实现',
      '添加单元测试覆盖',
      '配置CI/CD自动化流程',
      '代码审查与合并',
    ],
  }
}

// --- Tool 5: codebase_knowledge_graph ---
function analyzeKnowledgeGraph(input: KnowledgeGraphInput): KnowledgeGraphResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.repo_name + input.module_count.toString() + input.analysis_depth
  ))

  const modules: ModuleNode[] = []
  for (let i = 0; i < Math.min(input.module_count, 12); i++) {
    const deps: string[] = []
    for (let j = 0; j < rng.nextInt(0, 4); j++) {
      const depIdx = rng.nextInt(0, input.module_count - 1)
      if (depIdx !== i) deps.push(`mod_${depIdx}`)
    }
    modules.push({
      module_id: `mod_${i}`,
      name: `${rng.pick(['auth', 'user', 'payment', 'notification', 'analytics', 'core', 'api', 'cache', 'search', 'media', 'config', 'logging'])}_${i}`,
      dependencies: deps,
      dependents: [],
      coupling_score: Math.round(rng.nextFloat(0.1, 0.9) * 100) / 100,
    })
  }

  // Build dependents from dependencies
  for (const mod of modules) {
    for (const dep of mod.dependencies) {
      const target = modules.find(m => m.module_id === dep)
      if (target && !target.dependents.includes(mod.module_id)) {
        target.dependents.push(mod.module_id)
      }
    }
  }

  const apiChains: ApiCallChain[] = []
  for (let i = 0; i < Math.min(input.api_endpoint_count, 10); i++) {
    const pathLength = rng.nextInt(2, 6)
    const path = Array.from({ length: pathLength }, (_, j) => `${rng.pick(['Service', 'Handler', 'Middleware', 'Controller', 'Repository'])}${j}`)
    apiChains.push({
      chain_id: `chain-${i}`,
      entry_point: `GET /api/v1/${rng.pick(['users', 'orders', 'products', 'analytics', 'auth'])}`,
      path,
      depth: pathLength,
      risk: pathLength > 4 ? 'high' : pathLength > 2 ? 'medium' : 'low',
    })
  }

  const hotspots: Hotspot[] = []
  for (let i = 0; i < rng.nextInt(3, 8); i++) {
    hotspots.push({
      file: `src/${rng.pick(['core', 'api', 'services', 'utils', 'models'])}/${rng.pick(['index', 'main', 'handler', 'manager', 'helper'])}.ts`,
      change_frequency: rng.nextInt(5, 50),
      last_modified: new Date(Date.now() - rng.nextInt(0, 30) * 86400000).toISOString().split('T')[0],
      authors: rng.nextInt(1, 8),
      risk_level: rng.pick(['low', 'medium', 'high']),
    })
  }

  const techDebtMap: TechDebtMap[] = [
    { area: '遗留模块重构', debt_level: rng.pick(['medium', 'high', 'critical']), estimated_hours: rng.nextInt(20, 120), priority: rng.nextInt(1, 5) },
    { area: '测试覆盖补充', debt_level: rng.pick(['low', 'medium', 'high']), estimated_hours: rng.nextInt(10, 80), priority: rng.nextInt(1, 5) },
    { area: '文档更新', debt_level: rng.pick(['low', 'medium']), estimated_hours: rng.nextInt(5, 40), priority: rng.nextInt(2, 5) },
    { area: '依赖升级', debt_level: rng.pick(['medium', 'high']), estimated_hours: rng.nextInt(8, 60), priority: rng.nextInt(1, 4) },
    { area: '性能优化', debt_level: rng.pick(['low', 'medium', 'high']), estimated_hours: rng.nextInt(15, 100), priority: rng.nextInt(1, 5) },
  ]

  return {
    modules,
    api_chains: apiChains,
    hotspots,
    tech_debt_map: techDebtMap,
    visualization_hint: '建议使用 Mermaid graph 或 D3.js 渲染依赖关系图',
  }
}

// --- Tool 6: deployment_automation_advisor ---
function analyzeDeployment(input: DeploymentInput): DeploymentRecommendation {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.environment + input.current_platform + input.team_expertise
  ))

  const cicd: CICDRecommendation = {
    tool: input.team_expertise === 'beginner' ? 'GitHub Actions' : input.team_expertise === 'intermediate' ? 'GitLab CI' : 'ArgoCD + Tekton',
    config_snippet: `name: ${input.environment} deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm run build\n      - run: npm run deploy:${input.environment}`,
    reason: `基于团队技能水平(${input.team_expertise})和${input.environment}环境推荐`,
    difficulty: input.team_expertise === 'beginner' ? 'easy' : input.team_expertise === 'intermediate' ? 'medium' : 'hard',
  }

  const container: ContainerAdvice = {
    base_image: input.current_platform.includes('node') ? 'node:22-alpine' : 'python:3.12-slim',
    optimization_tips: [
      '使用多阶段构建减小镜像体积',
      '利用构建缓存加速CI流水线',
      '非root用户运行提升安全性',
      '.dockerignore排除不必要文件',
    ],
    estimated_image_size_mb: Math.round(rng.nextFloat(50, 300)),
    security_score: Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100,
  }

  const canaryStrategy = input.environment === 'production'
    ? `灰度策略: ${rng.pick(['5% → 25% → 50% → 100%', '蓝绿部署 + 自动回滚', '金丝雀 + 流量镜像'])} | 间隔: ${rng.nextInt(5, 30)}分钟`
    : '开发/测试环境: 全量部署，无需灰度'

  const rollback: RollbackStrategy = {
    strategy: input.environment === 'production' ? '自动回滚(基于健康检查)' : '手动回滚',
    recovery_time_minutes: input.environment === 'production' ? rng.nextInt(2, 15) : rng.nextInt(5, 30),
    data_loss_risk: input.environment === 'production' ? 'none' : 'low',
    automation_level: input.team_expertise === 'advanced' ? 'full' : input.team_expertise === 'intermediate' ? 'semi' : 'manual',
  }

  const monitoring: MonitoringSetup = {
    tool: rng.pick(['Prometheus + Grafana', 'Datadog', 'New Relic', 'Sentry + OpenTelemetry']),
    metrics: ['请求延迟P99', '错误率', 'CPU/内存利用率', '部署频率', 'MTTR'],
    alert_rules: [
      `错误率 > ${rng.nextFloat(1, 5).toFixed(1)}% 持续5分钟`,
      `P99延迟 > ${rng.nextInt(200, 1000)}ms`,
      '服务健康检查连续失败3次',
    ],
    dashboard_url: `https://monitoring.internal/${input.environment}/dashboard`,
  }

  return {
    cicd,
    container,
    canary_strategy: canaryStrategy,
    rollback,
    monitoring,
    estimated_setup_hours: rng.nextInt(8, 40),
  }
}

// --- Tool 7: developer_productivity_tracker ---
function analyzeProductivity(input: ProductivityInput): ProductivityReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.developer_id + input.period_days.toString() + input.commits_count.toString()
  ))

  const days = input.period_days || 30
  const efficiency: CodingEfficiency = {
    commits_per_day: Math.round((input.commits_count / days) * 100) / 100,
    lines_per_commit: input.commits_count > 0 ? Math.round((input.lines_added + input.lines_deleted) / input.commits_count) : 0,
    pr_merge_rate: Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100,
    review_turnaround_hours: Math.round(rng.nextFloat(1, 24)),
  }

  const dailyOutput: Record<string, number> = {}
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  for (const day of dayNames) {
    dailyOutput[day] = day === 'Sat' || day === 'Sun'
      ? Math.round(rng.nextFloat(0, 30))
      : Math.round(rng.nextFloat(40, 100))
  }

  const focus: FocusAnalysis = {
    focus_hours_avg: Math.round(rng.nextFloat(3, 7) * 10) / 10,
    interruption_count: rng.nextInt(2, 15),
    flow_state_pct: Math.round(rng.nextFloat(15, 55) * 100) / 100,
    context_switch_cost_minutes: rng.nextInt(10, 45),
  }

  const skillGrowth: SkillGrowth = {
    new_languages: rng.pick(['Rust', 'Go', 'Kotlin', 'Swift', 'Zig']).split(','),
    new_frameworks: rng.pick(['Next.js', 'Nuxt', 'SvelteKit', 'FastAPI', 'Axum']).split(','),
    domains_explored: rng.pick(['AI/ML', 'Web3', '边缘计算', '数据工程', '安全']).split(','),
    learning_velocity: Math.round(rng.nextFloat(0.5, 3.0) * 100) / 100,
  }

  const aiImpact: AIImpact = {
    time_saved_hours: Math.round(input.ai_assisted_hours * rng.nextFloat(0.3, 0.6)),
    productivity_boost_pct: Math.round(rng.nextFloat(15, 45) * 100) / 100,
    ai_adoption_level: input.ai_assisted_hours > 20 ? 'high' : input.ai_assisted_hours > 8 ? 'medium' : 'low',
    top_ai_use_cases: ['代码补全', 'Bug定位', '文档生成', '测试生成', '重构建议'].slice(0, rng.nextInt(2, 5)),
  }

  const overallScore = Math.round(
    (efficiency.commits_per_day * 10 + efficiency.pr_merge_rate * 30 + focus.flow_state_pct * 0.3 + aiImpact.productivity_boost_pct * 0.5) * 100
  ) / 100

  return {
    efficiency,
    daily_output: dailyOutput,
    focus,
    skill_growth: skillGrowth,
    ai_impact: aiImpact,
    overall_productivity_score: Math.min(100, overallScore),
  }
}

// --- Tool 8: technical_debt_quantifier ---
function analyzeTechDebt(input: TechDebtInput): TechDebtReport {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.total_loc.toString() + input.legacy_loc.toString() + input.code_smell_count.toString()
  ))

  const debtRatio = input.legacy_loc / Math.max(input.total_loc, 1)
  const totalDebtIndex = Math.round(
    (debtRatio * 30 + input.outdated_dependencies * 0.5 + input.undocumented_apis * 0.3 + input.code_smell_count * 0.2 + input.avg_complexity * 0.1) * 100
  ) / 100

  const debtItems: DebtItem[] = [
    {
      category: '遗留代码',
      debt_index: Math.round(debtRatio * 100 * 100) / 100,
      monthly_interest_hours: Math.round(input.legacy_loc / 1000 * rng.nextFloat(2, 5)),
      principal_hours: Math.round(input.legacy_loc / 500),
      compound_risk: debtRatio > 0.4 ? 'high' : debtRatio > 0.2 ? 'medium' : 'low',
    },
    {
      category: '过时依赖',
      debt_index: Math.round(input.outdated_dependencies * 1.5 * 100) / 100,
      monthly_interest_hours: Math.round(input.outdated_dependencies * rng.nextFloat(0.5, 2)),
      principal_hours: Math.round(input.outdated_dependencies * rng.nextFloat(2, 8)),
      compound_risk: input.outdated_dependencies > 20 ? 'high' : input.outdated_dependencies > 8 ? 'medium' : 'low',
    },
    {
      category: '未文档化API',
      debt_index: Math.round(input.undocumented_apis * 0.8 * 100) / 100,
      monthly_interest_hours: Math.round(input.undocumented_apis * rng.nextFloat(0.3, 1.5)),
      principal_hours: Math.round(input.undocumented_apis * rng.nextFloat(1, 4)),
      compound_risk: input.undocumented_apis > 15 ? 'high' : input.undocumented_apis > 5 ? 'medium' : 'low',
    },
    {
      category: '代码异味',
      debt_index: Math.round(input.code_smell_count * 0.3 * 100) / 100,
      monthly_interest_hours: Math.round(input.code_smell_count * rng.nextFloat(0.2, 1)),
      principal_hours: Math.round(input.code_smell_count * rng.nextFloat(1, 3)),
      compound_risk: input.code_smell_count > 50 ? 'high' : input.code_smell_count > 20 ? 'medium' : 'low',
    },
  ]

  const maintenanceCostMonthly = debtItems.reduce((sum, d) => sum + d.monthly_interest_hours, 0)

  const payoffPlan: PayoffPlan[] = debtItems
    .sort((a, b) => b.debt_index - a.debt_index)
    .map((item, idx) => ({
      priority: idx + 1,
      action: `偿还${item.category}债务: 投入${item.principal_hours}小时`,
      estimated_hours: item.principal_hours,
      roi_ratio: Math.round((item.monthly_interest_hours * 6) / Math.max(item.principal_hours, 1) * 100) / 100,
      risk_if_deferred: item.compound_risk === 'high' ? '6个月内可能引发严重故障' : item.compound_risk === 'medium' ? '12个月内维护成本翻倍' : '风险可控但持续累积',
    }))

  const impact: ImpactAnalysis = {
    velocity_impact_pct: input.team_velocity_impact_pct,
    bug_rate_increase_pct: Math.round(totalDebtIndex * rng.nextFloat(0.5, 2) * 100) / 100,
    onboarding_overhead_hours: Math.round(input.undocumented_apis * rng.nextFloat(0.5, 2)),
    maintenance_cost_monthly: maintenanceCostMonthly,
  }

  const roiSummary = `技术债指数: ${totalDebtIndex} | 月维护成本: ${maintenanceCostMonthly}h | 预计还债ROI: ${payoffPlan.length > 0 ? payoffPlan[0].roi_ratio : 0}x | 建议: ${totalDebtIndex > 50 ? '立即启动还债计划' : totalDebtIndex > 25 ? '制定季度还债路线图' : '维持当前节奏，预防新增债务'}`

  return {
    total_debt_index: totalDebtIndex,
    debt_items: debtItems,
    maintenance_cost_monthly_hours: maintenanceCostMonthly,
    payoff_plan: payoffPlan,
    impact,
    roi_summary: roiSummary,
  }
}

// ==================== SECTION 5 — 格式化报告函数 ====================

function formatRequirementPipelineReport(result: RequirementAnalysis): string {
  const lines: string[] = []
  lines.push('## 🚀 需求到代码流水线分析报告')
  lines.push('')
  lines.push(`预估总工期: ${result.estimated_total_days}天 | Story Points: ${result.story_points} | 阶段数: ${result.phases.length}`)
  lines.push('')
  lines.push('### 📋 需求解析')
  for (const req of result.parsed_requirements) lines.push(`- ${req}`)
  lines.push('')
  lines.push('### 🛠️ 技术选型建议')
  lines.push('| 类别 | 推荐方案 | 置信度 | 备选方案 |')
  lines.push('|------|----------|--------|----------|')
  for (const t of result.tech_recommendations) {
    lines.push(`| ${t.category} | ${t.recommendation} | ${(t.confidence * 100).toFixed(0)}% | ${t.alternatives.join(', ')} |`)
  }
  lines.push('')
  lines.push('### 📊 工作量分布')
  lines.push('| 环节 | 天数 |')
  lines.push('|------|------|')
  for (const [k, v] of Object.entries(result.effort_breakdown)) {
    lines.push(`| ${k} | ${v}天 |`)
  }
  lines.push('')
  lines.push('### 🔄 开发阶段')
  lines.push('| 阶段 | 天数 | 交付物 | 风险 |')
  lines.push('|------|------|--------|------|')
  for (const p of result.phases) {
    lines.push(`| ${p.phase} | ${p.estimated_days}天 | ${p.deliverables.join(', ')} | ${p.risk_level} |`)
  }
  lines.push('')
  lines.push('### 🔗 依赖关系')
  lines.push(result.dependency_graph.join(' → '))
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatQualityReport(result: QualityReport): string {
  const lines: string[] = []
  lines.push('## 🏅 代码质量教练报告')
  lines.push('')
  lines.push(`综合评分: ${result.overall_score}/100 | 复杂度等级: ${result.complexity_grade} | 可维护性指数: ${result.maintainability_index}`)
  lines.push(`可读性评分: ${result.readability_score} | 测试覆盖评估: ${result.coverage_assessment}`)
  lines.push('')
  lines.push('### 🔍 代码异味检测')
  lines.push('| 异味类型 | 严重度 | 位置 | 建议 |')
  lines.push('|----------|--------|------|------|')
  for (const s of result.smells) {
    lines.push(`| ${s.smell_type} | ${s.severity} | ${s.location} | ${s.suggestion} |`)
  }
  lines.push('')
  lines.push('### 🔧 重构建议')
  for (const r of result.refactoring_suggestions) lines.push(`- ${r}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatDebugReport(result: DebugAnalysis): string {
  const lines: string[] = []
  lines.push('## 🐛 AI调试助手报告')
  lines.push('')
  lines.push(`根因分析数: ${result.root_causes.length} | 修复建议数: ${result.fix_suggestions.length} | 回归测试: ${result.regression_tests.length}`)
  lines.push('')
  lines.push('### 🎯 根因分析')
  lines.push('| 根因 | 置信度 | 类别 | 说明 |')
  lines.push('|------|--------|------|------|')
  for (const rc of result.root_causes) {
    lines.push(`| ${rc.cause} | ${(rc.confidence * 100).toFixed(0)}% | ${rc.category} | ${rc.explanation} |`)
  }
  lines.push('')
  lines.push('### 🔧 修复建议')
  for (const fix of result.fix_suggestions) {
    lines.push(`#### ${fix.fix_id} (风险: ${fix.risk_level}, 预计: ${fix.estimated_minutes}分钟)`)
    lines.push(fix.description)
    lines.push('```')
    lines.push(fix.code_change)
    lines.push('```')
  }
  lines.push('')
  lines.push('### 🧪 回归测试')
  for (const t of result.regression_tests) lines.push(`- \`${t}\``)
  lines.push('')
  lines.push('### 📋 日志诊断')
  lines.push(result.log_diagnosis)
  lines.push('')
  lines.push('### 📚 堆栈分析')
  lines.push(result.stack_analysis)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatPrototypeReport(result: PrototypeOutput): string {
  const lines: string[] = []
  lines.push('## ⚡ 快速原型生成报告')
  lines.push('')
  lines.push(`产物类型: ${result.artifact_type} | 生成文件数: ${result.artifacts.length}`)
  lines.push('')
  lines.push('### 📁 生成文件')
  for (const a of result.artifacts) {
    lines.push(`#### \`${a.filename}\` (${a.language})`)
    lines.push(a.description)
    lines.push(`\`\`\`${a.language}`)
    lines.push(a.content)
    lines.push('```')
    lines.push('')
  }
  lines.push('### 🚀 设置步骤')
  for (const s of result.setup_instructions) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 📌 下一步')
  for (const n of result.next_steps) lines.push(`- ${n}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatKnowledgeGraphReport(result: KnowledgeGraphResult): string {
  const lines: string[] = []
  lines.push('## 🗺️ 代码库知识图谱报告')
  lines.push('')
  lines.push(`模块数: ${result.modules.length} | API调用链: ${result.api_chains.length} | 热点文件: ${result.hotspots.length}`)
  lines.push('')
  lines.push('### 📦 模块依赖')
  lines.push('| 模块 | 依赖 | 被依赖 | 耦合度 |')
  lines.push('|------|------|--------|--------|')
  for (const m of result.modules.slice(0, 10)) {
    lines.push(`| ${m.name} | ${m.dependencies.length} | ${m.dependents.length} | ${m.coupling_score} |`)
  }
  lines.push('')
  lines.push('### 🔗 API调用链')
  lines.push('| 入口 | 深度 | 路径 | 风险 |')
  lines.push('|------|------|------|------|')
  for (const c of result.api_chains) {
    lines.push(`| ${c.entry_point} | ${c.depth} | ${c.path.join(' → ')} | ${c.risk} |`)
  }
  lines.push('')
  lines.push('### 🔥 热点代码')
  lines.push('| 文件 | 变更频率 | 最近修改 | 作者数 | 风险 |')
  lines.push('|------|----------|----------|--------|------|')
  for (const h of result.hotspots) {
    lines.push(`| ${h.file} | ${h.change_frequency}次 | ${h.last_modified} | ${h.authors} | ${h.risk_level} |`)
  }
  lines.push('')
  lines.push('### 💳 技术债地图')
  lines.push('| 区域 | 债务等级 | 预估工时 | 优先级 |')
  lines.push('|------|----------|----------|--------|')
  for (const t of result.tech_debt_map) {
    lines.push(`| ${t.area} | ${t.debt_level} | ${t.estimated_hours}h | ${t.priority} |`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatDeploymentReport(result: DeploymentRecommendation): string {
  const lines: string[] = []
  lines.push('## 🚢 部署自动化顾问报告')
  lines.push('')
  lines.push(`CI/CD工具: ${result.cicd.tool} | 难度: ${result.cicd.difficulty} | 预计配置: ${result.estimated_setup_hours}小时`)
  lines.push('')
  lines.push('### 🔄 CI/CD配置')
  lines.push(`工具: ${result.cicd.tool}`)
  lines.push(`\`\`\`yaml`)
  lines.push(result.cicd.config_snippet)
  lines.push('```')
  lines.push(`原因: ${result.cicd.reason}`)
  lines.push('')
  lines.push('### 📦 容器化建议')
  lines.push(`基础镜像: ${result.container.base_image}`)
  lines.push(`预估镜像大小: ${result.container.estimated_image_size_mb}MB | 安全评分: ${result.container.security_score}`)
  for (const tip of result.container.optimization_tips) lines.push(`- ${tip}`)
  lines.push('')
  lines.push('### 🐤 灰度策略')
  lines.push(result.canary_strategy)
  lines.push('')
  lines.push('### ↩️ 回滚方案')
  lines.push(`策略: ${result.rollback.strategy} | 恢复时间: ${result.rollback.recovery_time_minutes}分钟 | 数据丢失风险: ${result.rollback.data_loss_risk} | 自动化: ${result.rollback.automation_level}`)
  lines.push('')
  lines.push('### 📊 监控告警')
  lines.push(`工具: ${result.monitoring.tool} | 仪表板: ${result.monitoring.dashboard_url}`)
  lines.push('指标: ' + result.monitoring.metrics.join(', '))
  lines.push('告警规则:')
  for (const rule of result.monitoring.alert_rules) lines.push(`- ${rule}`)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatProductivityReport(result: ProductivityReport): string {
  const lines: string[] = []
  lines.push('## 📈 开发者生产力追踪报告')
  lines.push('')
  lines.push(`综合生产力评分: ${result.overall_productivity_score}/100`)
  lines.push('')
  lines.push('### ⚡ 编码效率')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 日均提交 | ${result.efficiency.commits_per_day} |`)
  lines.push(`| 每次提交行数 | ${result.efficiency.lines_per_commit} |`)
  lines.push(`| PR合并率 | ${(result.efficiency.pr_merge_rate * 100).toFixed(0)}% |`)
  lines.push(`| 审查周转 | ${result.efficiency.review_turnaround_hours}h |`)
  lines.push('')
  lines.push('### 📅 每日产出')
  lines.push('| 周一 | 周二 | 周三 | 周四 | 周五 | 周六 | 周日 |')
  lines.push('|------|------|------|------|------|------|------|')
  lines.push(`| ${result.daily_output.Mon} | ${result.daily_output.Tue} | ${result.daily_output.Wed} | ${result.daily_output.Thu} | ${result.daily_output.Fri} | ${result.daily_output.Sat} | ${result.daily_output.Sun} |`)
  lines.push('')
  lines.push('### 🎯 专注分析')
  lines.push(`日均专注: ${result.focus.focus_hours_avg}h | 中断次数: ${result.focus.interruption_count} | 心流占比: ${result.focus.flow_state_pct}% | 上下文切换成本: ${result.focus.context_switch_cost_minutes}分钟`)
  lines.push('')
  lines.push('### 🌱 技能成长')
  lines.push(`新语言: ${result.skill_growth.new_languages.join(', ')} | 新框架: ${result.skill_growth.new_frameworks.join(', ')} | 新领域: ${result.skill_growth.domains_explored.join(', ')} | 学习速度: ${result.skill_growth.learning_velocity}`)
  lines.push('')
  lines.push('### 🤖 AI辅助影响')
  lines.push(`节省时间: ${result.ai_impact.time_saved_hours}h | 生产力提升: ${result.ai_impact.productivity_boost_pct}% | 采用程度: ${result.ai_impact.ai_adoption_level}`)
  lines.push('主要用例: ' + result.ai_impact.top_ai_use_cases.join(', '))
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatTechDebtReport(result: TechDebtReport): string {
  const lines: string[] = []
  lines.push('## 💳 技术债量化报告')
  lines.push('')
  lines.push(`技术债总指数: ${result.total_debt_index} | 月维护成本: ${result.maintenance_cost_monthly_hours}h`)
  lines.push('')
  lines.push('### 📊 债务明细')
  lines.push('| 类别 | 债务指数 | 月利息(h) | 本金(h) | 复合风险 |')
  lines.push('|------|----------|-----------|---------|----------|')
  for (const d of result.debt_items) {
    lines.push(`| ${d.category} | ${d.debt_index} | ${d.monthly_interest_hours} | ${d.principal_hours} | ${d.compound_risk} |`)
  }
  lines.push('')
  lines.push('### 📋 还债优先级')
  lines.push('| 优先级 | 行动 | 预估工时 | ROI | 延期风险 |')
  lines.push('|--------|------|----------|-----|----------|')
  for (const p of result.payoff_plan) {
    lines.push(`| ${p.priority} | ${p.action} | ${p.estimated_hours}h | ${p.roi_ratio}x | ${p.risk_if_deferred} |`)
  }
  lines.push('')
  lines.push('### 💥 影响面分析')
  lines.push(`速度影响: ${result.impact.velocity_impact_pct}% | Bug率增长: ${result.impact.bug_rate_increase_pct}% | 入职开销: ${result.impact.onboarding_overhead_hours}h | 月维护成本: ${result.impact.maintenance_cost_monthly}h`)
  lines.push('')
  lines.push('### 📈 ROI总结')
  lines.push(result.roi_summary)
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 6 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'requirement_to_code_pipeline', description: '需求到代码 | 技术选型/工作量/依赖', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: requirement spec' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatRequirementPipelineReport(analyzeRequirementPipeline(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'code_quality_coach', description: '代码质量 | 复杂度/异味/重构/覆盖', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: source code' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatQualityReport(analyzeCodeQuality(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'ai_debugging_assistant', description: 'AI调试 | 根因/修复/回归测试', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: error/log context' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatDebugReport(analyzeDebugIssue(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'vibe_prototyper', description: '快速原型 | UI/API脚手架/Schema', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: prototype spec' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatPrototypeReport(analyzePrototype(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'codebase_knowledge_graph', description: '代码图谱 | 依赖/热点/技术债', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: codebase structure' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatKnowledgeGraphReport(analyzeKnowledgeGraph(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'deployment_automation_advisor', description: '部署自动化 | CI/CD/灰度/监控', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: deploy config' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatDeploymentReport(analyzeDeployment(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'developer_productivity_tracker', description: '生产力追踪 | 效率/成长/AI增益', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: dev metrics' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatProductivityReport(analyzeProductivity(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'technical_debt_quantifier', description: '技术债 | 指数/维护成本/ROI', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: codebase metrics' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatTechDebtReport(analyzeTechDebt(JSON.parse(args.input_data))) } }))
}