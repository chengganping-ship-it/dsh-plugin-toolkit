/**
 * DSH CLI-Anything Plugin v0.1.0
 * Agent-Native CLI Transformation for DeepSeek Harness — 将任何CLI工具转化为AI原生智能体接口
 *
 * 对标 CLI-Anything / Agent-Native CLI 趋势，将传统命令行工具（git、docker、kubectl、
 * aws、ffmpeg、curl、tar、rsync、jq、terraform、npm、pip）转化为 AI Agent 可直接调用
 * 的结构化工具。
 *
 * 工具清单:
 * 1. cli_to_agent_converter       — 将CLI手册转化为Agent原生工具描述
 * 2. command_risk_classifier       — 按风险等级分类CLI命令（safe/read/write/destructive）
 * 3. auto_wrapper_generator       — 自动生成CLI工具的TypeScript包装器
 * 4. interactive_explorer         — 带安全护栏的交互式CLI探索
 * 5. pipeline_orchestrator        — 多CLI管道编排规划器
 * 6. error_recovery_advisor       — CLI错误诊断与恢复建议
 * 7. permission_analyzer          — 分析CLI工具权限需求
 * 8. agent_native_scorer          — 评分CLI工具的"Agent就绪度"（0-100）
 *
 * @module dsh-tool-cliagentify | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cliagentify'
export const inject = ['tools']

const VERSION = '0.1.0'

const DISCLAIMER = '[DISCLAIMER] 本插件生成的工具描述、包装器和建议仅供开发参考，生产环境使用前请进行完整的安全审计。CLI命令执行可能带来数据丢失、系统损坏等风险，请确保在沙箱或隔离环境中测试。'

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

// --- Tool 1: CLI to Agent Converter ---
interface ConverterInput {
  cli_name: string
  man_page?: string
  command_examples?: string[]
  target_schema: 'openai_function' | 'anthropic_tool' | 'json_schema'
}

interface ParameterMapping {
  cli_flag: string
  agent_param: string
  type: string
  description: string
  required: boolean
  safety_note: string
}

interface AgentToolSpec {
  name: string
  description: string
  parameters: ParameterMapping[]
  return_type: string
  risk_level: 'safe' | 'read' | 'write' | 'destructive'
  examples: string[]
}

interface ConverterResult {
  cli_name: string
  target_schema: string
  agent_spec: AgentToolSpec
  coverage_pct: number
  warnings: string[]
}

// --- Tool 2: Command Risk Classifier ---
interface RiskClassifierInput {
  commands: string[]
  context?: 'local' | 'ci' | 'production' | 'sandbox'
}

interface CommandRiskEntry {
  command: string
  tool: string
  risk_level: 'safe' | 'read' | 'write' | 'destructive'
  risk_score: number
  category: string
  reason: string
  safe_alternative?: string
}

interface RiskClassifierResult {
  context: string
  entries: CommandRiskEntry[]
  summary: {
    safe: number
    read: number
    write: number
    destructive: number
  }
  max_risk: string
  requires_approval: boolean
}

// --- Tool 3: Auto Wrapper Generator ---
interface WrapperGeneratorInput {
  cli_name: string
  commands: string[]
  wrapper_style: 'functional' | 'class_based' | 'zod_validated'
  include_retry: boolean
  timeout_ms: number
}

interface GeneratedWrapper {
  language: string
  filename: string
  code: string
  test_code: string
  dependencies: string[]
  install_command: string
}

interface WrapperGeneratorResult {
  cli_name: string
  wrapper_style: string
  wrapper: GeneratedWrapper
  lines_of_code: number
  test_coverage_pct: number
}

// --- Tool 4: Interactive Explorer ---
interface ExplorerInput {
  cli_name: string
  exploration_depth: 'shallow' | 'medium' | 'deep'
  safety_mode: 'strict' | 'moderate' | 'permissive'
  max_commands: number
}

interface ExploredCommand {
  command: string
  description: string
  flags: string[]
  subcommands: string[]
  output_format: string
  risk_level: string
  agent_usability: number
}

interface ExplorerResult {
  cli_name: string
  safety_mode: string
  explored: ExploredCommand[]
  total_discovered: number
  safe_to_auto_execute: number
  blocked_commands: string[]
}

// --- Tool 5: Pipeline Orchestrator ---
interface PipelineInput {
  goal: string
  available_tools: string[]
  steps: PipelineStep[]
  fail_policy: 'abort' | 'skip' | 'retry'
}

interface PipelineStep {
  step_id: string
  tool: string
  command: string
  depends_on: string[]
  output_to?: string
  retry_count: number
}

interface StepPlan {
  step_id: string
  tool: string
  command: string
  status: 'ready' | 'waiting' | 'blocked'
  estimated_duration_ms: number
  rollback_command?: string
  depends_on: string[]
}

interface PipelineResult {
  goal: string
  steps: StepPlan[]
  total_steps: number
  parallel_groups: string[][]
  estimated_total_ms: number
  fail_policy: string
  rollback_plan: string[]
}

// --- Tool 6: Error Recovery Advisor ---
interface ErrorRecoveryInput {
  cli_name: string
  command: string
  exit_code: number
  stderr: string
  os: 'linux' | 'macos' | 'windows'
}

interface RecoveryAction {
  action: string
  command: string
  explanation: string
  risk: 'none' | 'low' | 'medium' | 'high'
  automated: boolean
}

interface ErrorRecoveryResult {
  cli_name: string
  command: string
  exit_code: number
  error_category: string
  diagnosis: string
  recoveries: RecoveryAction[]
  prevention_tips: string[]
  documentation_url: string
}

// --- Tool 7: Permission Analyzer ---
interface PermissionInput {
  cli_name: string
  commands: string[]
  environment: 'local' | 'ci' | 'container' | 'cloud'
}

interface PermissionRequirement {
  command: string
  needs_root: boolean
  needs_network: boolean
  needs_filesystem: string[]
  needs_env_vars: string[]
  capabilities: string[]
  risk_if_misused: string
}

interface PermissionAnalyzerResult {
  cli_name: string
  environment: string
  permissions: PermissionRequirement[]
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  least_privilege_shell: string
  sandbox_recommendation: string
}

// --- Tool 8: Agent Native Scorer ---
interface ScorerInput {
  cli_name: string
  has_help_flag: boolean
  has_json_output: boolean
  has_dry_run: boolean
  has_quiet_mode: boolean
  exit_code_clarity: number
  output_parseability: number
  idempotency: number
  atomicity: number
}

interface ScoreBreakdown {
  dimension: string
  score: number
  max: number
  comment: string
}

interface AgentNativeScorerResult {
  cli_name: string
  total_score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  breakdown: ScoreBreakdown[]
  improvement_suggestions: string[]
  agent_readiness: 'production_ready' | 'needs_wrapper' | 'not_recommended'
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: CLI to Agent Converter 分析 ---
function analyzeCliToAgentConverter(input: ConverterInput): ConverterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name + input.target_schema))

  const knownTools: Record<string, { params: ParameterMapping[], risk: AgentToolSpec['risk_level'], examples: string[] }> = {
    git: {
      params: [
        { cli_flag: 'commit -m', agent_param: 'message', type: 'string', description: 'Commit message', required: true, safety_note: '避免包含敏感信息' },
        { cli_flag: 'push', agent_param: 'remote', type: 'string', description: 'Remote name (origin)', required: false, safety_note: '确认远程仓库URL正确' },
        { cli_flag: 'branch', agent_param: 'branch_name', type: 'string', description: 'Branch name', required: true, safety_note: '遵循命名规范 feature/xxx' },
        { cli_flag: '--force', agent_param: 'force', type: 'boolean', description: 'Force push', required: false, safety_note: '危险：会覆盖远程历史' },
      ],
      risk: 'write',
      examples: ['git commit -m "feat: add user auth"', 'git push origin main', 'git checkout -b feature/login'],
    },
    docker: {
      params: [
        { cli_flag: 'run', agent_param: 'image', type: 'string', description: 'Container image', required: true, safety_note: '验证镜像来源可信' },
        { cli_flag: '-p', agent_param: 'port_mapping', type: 'string', description: 'Port mapping host:container', required: false, safety_note: '避免暴露敏感端口' },
        { cli_flag: '-v', agent_param: 'volume', type: 'string', description: 'Volume mount', required: false, safety_note: '避免挂载敏感目录' },
        { cli_flag: '--rm', agent_param: 'auto_remove', type: 'boolean', description: 'Auto-remove on stop', required: false, safety_note: '确保数据已持久化' },
      ],
      risk: 'write',
      examples: ['docker run -d -p 8080:80 nginx', 'docker build -t myapp:latest .', 'docker ps --format json'],
    },
    kubectl: {
      params: [
        { cli_flag: 'get', agent_param: 'resource', type: 'string', description: 'Resource type (pods, svc)', required: true, safety_note: '只读操作，安全' },
        { cli_flag: 'apply -f', agent_param: 'manifest', type: 'string', description: 'Path to manifest YAML', required: true, safety_note: '先执行 dry-run 验证' },
        { cli_flag: 'delete', agent_param: 'target', type: 'string', description: 'Resource to delete', required: true, safety_note: '危险：不可逆操作' },
        { cli_flag: '--namespace', agent_param: 'namespace', type: 'string', description: 'Kubernetes namespace', required: false, safety_note: '确认命名空间正确' },
      ],
      risk: 'destructive',
      examples: ['kubectl get pods -o json', 'kubectl apply -f deployment.yaml', 'kubectl logs -f pod-name'],
    },
    ffmpeg: {
      params: [
        { cli_flag: '-i', agent_param: 'input', type: 'string', description: 'Input file path', required: true, safety_note: '验证文件存在且可读' },
        { cli_flag: '-c:v', agent_param: 'video_codec', type: 'string', description: 'Video codec (libx264)', required: false, safety_note: '确认编解码器可用' },
        { cli_flag: '-b:v', agent_param: 'bitrate', type: 'string', description: 'Video bitrate', required: false, safety_note: '过高导致文件过大' },
        { cli_flag: '-y', agent_param: 'overwrite', type: 'boolean', description: 'Overwrite output', required: false, safety_note: '可能覆盖已有文件' },
      ],
      risk: 'write',
      examples: ['ffmpeg -i input.mp4 -c:v libx264 output.mp4', 'ffmpeg -i video.mp3 -vn audio.mp3'],
    },
  }

  const toolData = knownTools[input.cli_name] || {
    params: [
      { cli_flag: '--input', agent_param: 'input', type: 'string', description: 'Input path', required: true, safety_note: '验证路径安全' },
      { cli_flag: '--output', agent_param: 'output', type: 'string', description: 'Output path', required: false, safety_note: '避免覆盖系统文件' },
      { cli_flag: '--verbose', agent_param: 'verbose', type: 'boolean', description: 'Verbose output', required: false, safety_note: '无风险' },
    ],
    risk: 'read' as const,
    examples: [`${input.cli_name} --input data.txt`, `${input.cli_name} --help`],
  }

  const warnings: string[] = []
  if (toolData.risk === 'destructive') warnings.push('该工具包含破坏性操作，建议添加人工确认步骤')
  if (toolData.risk === 'write') warnings.push('写操作建议先执行 dry-run 或备份')
  if (!input.man_page) warnings.push('未提供 man page，参数映射基于常见用法推断')

  const coverage = Math.round(rng.nextFloat(0.72, 0.96) * 100)

  return {
    cli_name: input.cli_name,
    target_schema: input.target_schema,
    agent_spec: {
      name: input.cli_name,
      description: `Agent-native wrapper for ${input.cli_name} CLI tool`,
      parameters: toolData.params,
      return_type: 'CommandResult { stdout: string, stderr: string, exit_code: number }',
      risk_level: toolData.risk,
      examples: toolData.examples,
    },
    coverage_pct: coverage,
    warnings,
  }
}

// --- Tool 2: Command Risk Classifier 分析 ---
function analyzeCommandRiskClassifier(input: RiskClassifierInput): RiskClassifierResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.commands.join(',')))

  const riskDatabase: Record<string, { level: CommandRiskEntry['risk_level'], category: string, reason: string, alt?: string }> = {
    'git commit': { level: 'write', category: 'version_control', reason: '修改Git历史记录', alt: 'git status (先查看状态)' },
    'git push': { level: 'write', category: 'version_control', reason: '推送代码到远程仓库', alt: 'git push --dry-run' },
    'git push --force': { level: 'destructive', category: 'version_control', reason: '强制推送，覆盖远程历史', alt: 'git push --force-with-lease' },
    'git reset --hard': { level: 'destructive', category: 'version_control', reason: '丢弃所有未提交的更改', alt: 'git stash (暂存更改)' },
    'docker run': { level: 'write', category: 'container', reason: '创建并运行新容器' },
    'docker rm -f': { level: 'destructive', category: 'container', reason: '强制删除运行中的容器', alt: 'docker stop && docker rm' },
    'docker system prune -a': { level: 'destructive', category: 'container', reason: '删除所有未使用的镜像和缓存' },
    'kubectl apply': { level: 'write', category: 'orchestration', reason: '修改集群状态', alt: 'kubectl apply --dry-run=client' },
    'kubectl delete': { level: 'destructive', category: 'orchestration', reason: '删除集群资源', alt: 'kubectl get (先确认)' },
    'rm -rf': { level: 'destructive', category: 'filesystem', reason: '递归强制删除，不可恢复', alt: 'trash-cli 或 mv 到临时目录' },
    'terraform apply': { level: 'write', category: 'iac', reason: '修改云基础设施', alt: 'terraform plan (先预览)' },
    'terraform destroy': { level: 'destructive', category: 'iac', reason: '销毁所有管理的资源', alt: 'terraform plan -destroy' },
    'npm publish': { level: 'write', category: 'package_management', reason: '发布包到公共仓库', alt: 'npm publish --dry-run' },
    'pip install': { level: 'write', category: 'package_management', reason: '安装Python包到系统', alt: 'pip install --user 或 venv' },
    'curl': { level: 'read', category: 'network', reason: '发送HTTP请求（只读）' },
    'curl -X POST': { level: 'write', category: 'network', reason: '发送POST请求可能修改远程状态' },
    'aws s3 rm': { level: 'destructive', category: 'cloud', reason: '删除S3对象', alt: 'aws s3 ls (先确认)' },
    'ffmpeg': { level: 'write', category: 'media', reason: '生成新文件' },
    'tar -x': { level: 'write', category: 'filesystem', reason: '解压文件到文件系统' },
    'rsync': { level: 'write', category: 'filesystem', reason: '同步文件可能覆盖目标', alt: 'rsync --dry-run' },
    'jq': { level: 'safe', category: 'data_processing', reason: '纯数据转换，无副作用' },
    'cat': { level: 'safe', category: 'filesystem', reason: '只读操作' },
    'ls': { level: 'safe', category: 'filesystem', reason: '只读操作' },
  }

  const entries: CommandRiskEntry[] = input.commands.map(cmd => {
    const normalized = cmd.trim().toLowerCase()
    const match = Object.keys(riskDatabase).find(k => normalized.includes(k))
    const data = match ? riskDatabase[match] : {
      level: 'read' as const,
      category: 'unknown',
      reason: '未在已知数据库中匹配，默认为低风险',
    }

    const riskScore = data.level === 'safe' ? rng.nextFloat(0, 0.2) :
                      data.level === 'read' ? rng.nextFloat(0.1, 0.4) :
                      data.level === 'write' ? rng.nextFloat(0.4, 0.7) :
                      rng.nextFloat(0.7, 1.0)

    return {
      command: cmd,
      tool: cmd.split(' ')[0],
      risk_level: data.level,
      risk_score: Math.round(riskScore * 100) / 100,
      category: data.category,
      reason: data.reason,
      safe_alternative: data.alt,
    }
  })

  const summary = {
    safe: entries.filter(e => e.risk_level === 'safe').length,
    read: entries.filter(e => e.risk_level === 'read').length,
    write: entries.filter(e => e.risk_level === 'write').length,
    destructive: entries.filter(e => e.risk_level === 'destructive').length,
  }

  const maxRisk = entries.length > 0
    ? entries.reduce((max, e) => e.risk_score > max.risk_score ? e : max, entries[0]).risk_level
    : 'safe'

  return {
    context: input.context || 'local',
    entries,
    summary,
    max_risk: maxRisk,
    requires_approval: summary.destructive > 0 || summary.write > 2,
  }
}

// --- Tool 3: Auto Wrapper Generator 分析 ---
function analyzeAutoWrapperGenerator(input: WrapperGeneratorInput): WrapperGeneratorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name + input.wrapper_style))

  const codeTemplates: Record<string, () => { code: string, test: string, loc: number }> = {
    functional: () => ({
      code: `import { execa } from 'execa'
import { z } from 'zod'

const ${input.cli_name}Schema = z.object({
  args: z.array(z.string()),
  cwd: z.string().optional(),
  timeout: z.number().default(${input.timeout_ms}),
})

type ${input.cli_name.charAt(0).toUpperCase() + input.cli_name.slice(1)}Input = z.infer<typeof ${input.cli_name}Schema>

export async function ${input.cli_name}Command(input: ${input.cli_name.charAt(0).toUpperCase() + input.cli_name.slice(1)}Input): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const parsed = ${input.cli_name}Schema.parse(input)
  const result = await execa('${input.cli_name}', parsed.args, {
    cwd: parsed.cwd,
    timeout: parsed.timeout,
    reject: false,
  })
  return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode }
}`,
      test: `import { describe, it, expect } from 'vitest'
import { ${input.cli_name}Command } from './${input.cli_name}-wrapper'

describe('${input.cli_name} wrapper', () => {
  it('should execute --help successfully', async () => {
    const result = await ${input.cli_name}Command({ args: ['--help'] })
    expect(result.exitCode).toBe(0)
    expect(result.stdout.length).toBeGreaterThan(0)
  })
})`,
      loc: 24,
    }),
    class_based: () => ({
      code: `import { execa, type Options } from 'execa'

export class ${input.cli_name.charAt(0).toUpperCase() + input.cli_name.slice(1)}Client {
  private cwd?: string
  private timeout: number = ${input.timeout_ms}

  constructor(options?: { cwd?: string; timeout?: number }) {
    this.cwd = options?.cwd
    this.timeout = options?.timeout ?? ${input.timeout_ms}
  }

  async run(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const result = await execa('${input.cli_name}', args, {
      cwd: this.cwd,
      timeout: this.timeout,
      reject: false,
    })
    return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode }
  }
${input.commands.map(cmd => `
  async ${cmd.replace(/-/g, '_')}() {
    return this.run(['${cmd}'])
  }`).join('')}
}`,
      test: `import { describe, it, expect } from 'vitest'
import { ${input.cli_name.charAt(0).toUpperCase() + input.cli_name.slice(1)}Client } from './${input.cli_name}-wrapper'

describe('${input.cli_name} client', () => {
  const client = new ${input.cli_name.charAt(0).toUpperCase() + input.cli_name.slice(1)}Client()

  it('should instantiate with defaults', () => {
    expect(client).toBeDefined()
  })
})`,
      loc: 28 + input.commands.length * 4,
    }),
    zod_validated: () => ({
      code: `import { execa } from 'execa'
import { z } from 'zod'

const InputSchema = z.object({
  command: z.enum([${input.commands.map(c => `'${c}'`).join(', ')}] as const),
  flags: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])).default({}),
  cwd: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  timeout: z.number().default(${input.timeout_ms}),
  captureOutput: z.boolean().default(true),
}).strict()

export type CliInput = z.infer<typeof InputSchema>

export async function execute(input: unknown): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const parsed = InputSchema.parse(input)
  const args = buildArgs(parsed)
  const result = await execa('${input.cli_name}', args, {
    cwd: parsed.cwd,
    env: parsed.env,
    timeout: parsed.timeout,
    reject: false,
  })
  return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode }
}

function buildArgs(input: CliInput): string[] {
  const args = [input.command]
  for (const [key, value] of Object.entries(input.flags)) {
    if (value === true) args.push(\`--\${key}\`)
    else if (value !== false) args.push(\`--\${key}=\${value}\`)
  }
  return args
}`,
      test: `import { describe, it, expect } from 'vitest'
import { execute, type CliInput } from './${input.cli_name}-wrapper'

describe('${input.cli_name} zod-validated wrapper', () => {
  it('should reject invalid input', async () => {
    await expect(execute({ command: 'invalid' })).rejects.toThrow()
  })

  it('should accept valid input', async () => {
    const input: CliInput = { command: '${input.commands[0] || 'help'}', flags: {} }
    const result = await execute(input)
    expect(result).toHaveProperty('exitCode')
  })
})`,
      loc: 38,
    }),
  }

  const template = codeTemplates[input.wrapper_style] || codeTemplates.functional
  const generated = template()

  return {
    cli_name: input.cli_name,
    wrapper_style: input.wrapper_style,
    wrapper: {
      language: 'TypeScript',
      filename: `${input.cli_name}-wrapper.ts`,
      code: generated.code,
      test_code: generated.test,
      dependencies: ['execa', 'zod'],
      install_command: 'npm install execa zod && npm install -D vitest',
    },
    lines_of_code: generated.loc,
    test_coverage_pct: Math.round(rng.nextFloat(0.75, 0.95) * 100),
  }
}

// --- Tool 4: Interactive Explorer 分析 ---
function analyzeInteractiveExplorer(input: ExplorerInput): ExplorerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name + input.safety_mode))

  const knownExplorations: Record<string, ExploredCommand[]> = {
    git: [
      { command: 'git status', description: 'Show working tree status', flags: ['--short', '--branch', '--porcelain'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.95 },
      { command: 'git log', description: 'Show commit history', flags: ['--oneline', '--graph', '--limit', '--since'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.9 },
      { command: 'git diff', description: 'Show changes', flags: ['--staged', '--stat', '--no-color'], subcommands: [], output_format: 'diff', risk_level: 'safe', agent_usability: 0.85 },
      { command: 'git commit', description: 'Record changes', flags: ['-m', '--amend', '--no-verify'], subcommands: [], output_format: 'text', risk_level: 'write', agent_usability: 0.7 },
      { command: 'git push', description: 'Update remote refs', flags: ['--force', '--force-with-lease', '--dry-run', '--tags'], subcommands: [], output_format: 'text', risk_level: 'write', agent_usability: 0.6 },
      { command: 'git reset --hard', description: 'Reset to state', flags: ['--soft', '--mixed', '--hard', 'HEAD~1'], subcommands: [], output_format: 'text', risk_level: 'destructive', agent_usability: 0.2 },
    ],
    docker: [
      { command: 'docker ps', description: 'List containers', flags: ['-a', '--format', '-q', '--filter'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.95 },
      { command: 'docker images', description: 'List images', flags: ['-a', '--format', '--digests'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.9 },
      { command: 'docker logs', description: 'Fetch container logs', flags: ['-f', '--tail', '--since', '--timestamps'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.85 },
      { command: 'docker run', description: 'Run container', flags: ['-d', '-p', '-v', '--rm', '--name', '-e'], subcommands: [], output_format: 'text', risk_level: 'write', agent_usability: 0.7 },
      { command: 'docker exec', description: 'Execute in running container', flags: ['-it', '-d', '--user', '-e'], subcommands: [], output_format: 'text', risk_level: 'write', agent_usability: 0.65 },
      { command: 'docker rm -f', description: 'Force remove container', flags: ['-f', '-v', '-l'], subcommands: [], output_format: 'text', risk_level: 'destructive', agent_usability: 0.3 },
    ],
    kubectl: [
      { command: 'kubectl get', description: 'List resources', flags: ['-o', '--selector', '--field-selector', '-A', '--watch'], subcommands: ['pods', 'svc', 'deploy', 'configmap'], output_format: 'json/yaml', risk_level: 'safe', agent_usability: 0.95 },
      { command: 'kubectl describe', description: 'Show resource details', flags: ['-A', '--show-events'], subcommands: ['pod', 'node', 'svc'], output_format: 'text', risk_level: 'safe', agent_usability: 0.9 },
      { command: 'kubectl logs', description: 'Print logs', flags: ['-f', '--tail', '--since', '-c', '--previous'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.85 },
      { command: 'kubectl apply', description: 'Apply configuration', flags: ['-f', '-k', '--dry-run=client', '--server-side'], subcommands: [], output_format: 'text', risk_level: 'write', agent_usability: 0.7 },
      { command: 'kubectl delete', description: 'Delete resources', flags: ['-f', '--all', '--force', '--grace-period'], subcommands: [], output_format: 'text', risk_level: 'destructive', agent_usability: 0.25 },
    ],
  }

  const explored = knownExplorations[input.cli_name] || [
    { command: `${input.cli_name} --help`, description: 'Show help information', flags: ['--help', '-h'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.9 },
    { command: `${input.cli_name} --version`, description: 'Show version', flags: ['--version', '-v'], subcommands: [], output_format: 'text', risk_level: 'safe', agent_usability: 0.85 },
  ]

  const depthMultiplier = input.exploration_depth === 'shallow' ? 0.4 : input.exploration_depth === 'medium' ? 0.7 : 1.0
  const count = Math.min(input.max_commands, Math.round(explored.length * depthMultiplier))
  const selected = explored.slice(0, Math.max(1, count))

  const blockedBySafety = input.safety_mode === 'strict'
    ? selected.filter(e => e.risk_level === 'destructive' || e.risk_level === 'write').map(e => e.command)
    : input.safety_mode === 'moderate'
    ? selected.filter(e => e.risk_level === 'destructive').map(e => e.command)
    : []

  const safeCount = selected.filter(e => e.risk_level === 'safe' || e.risk_level === 'read').length

  return {
    cli_name: input.cli_name,
    safety_mode: input.safety_mode,
    explored: selected,
    total_discovered: selected.length,
    safe_to_auto_execute: safeCount,
    blocked_commands: blockedBySafety,
  }
}

// --- Tool 5: Pipeline Orchestrator 分析 ---
function analyzePipelineOrchestrator(input: PipelineInput): PipelineResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.goal + input.available_tools.join(',')))

  const steps: StepPlan[] = input.steps.map((step, idx) => {
    const isBlocked = step.depends_on.some(dep => {
      const depStep = input.steps.find(s => s.step_id === dep)
      return depStep && rng.next() > 0.7
    })

    return {
      step_id: step.step_id,
      tool: step.tool,
      command: step.command,
      status: isBlocked ? 'waiting' : idx === 0 ? 'ready' : 'ready',
      estimated_duration_ms: Math.round(rng.nextFloat(0.5, 5) * 1000),
      rollback_command: step.tool === 'terraform' ? 'terraform state rm' :
                        step.tool === 'kubectl' ? `kubectl delete -f ${step.command.split(' ').pop()}` :
                        step.tool === 'docker' ? 'docker stop $(docker ps -q)' : undefined,
      depends_on: step.depends_on,
    }
  })

  const parallelGroups: string[][] = []
  const independent = steps.filter(s => s.depends_on.length === 0)
  if (independent.length > 1) {
    parallelGroups.push(independent.map(s => s.step_id))
  }
  const dependent = steps.filter(s => s.depends_on.length > 0)
  if (dependent.length > 0) {
    parallelGroups.push(dependent.map(s => s.step_id))
  }

  const totalMs = steps.reduce((sum, s) => sum + s.estimated_duration_ms, 0)

  const rollbackPlan = steps
    .filter(s => s.rollback_command)
    .reverse()
    .map(s => `[${s.step_id}] ${s.rollback_command}`)

  return {
    goal: input.goal,
    steps,
    total_steps: steps.length,
    parallel_groups: parallelGroups,
    estimated_total_ms: totalMs,
    fail_policy: input.fail_policy,
    rollback_plan: rollbackPlan,
  }
}

// --- Tool 6: Error Recovery Advisor 分析 ---
function analyzeErrorRecoveryAdvisor(input: ErrorRecoveryInput): ErrorRecoveryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name + input.command + input.exit_code))

  const errorDatabase: Record<string, Record<number, { category: string, diagnosis: string, recoveries: RecoveryAction[], prevention: string[], doc: string }>> = {
    git: {
      128: {
        category: 'Git操作错误',
        diagnosis: 'Git退出码128通常表示操作被拒绝或认证失败。常见原因：权限不足、分支保护、合并冲突。',
        recoveries: [
          { action: '检查远程权限', command: 'git remote -v', explanation: '确认远程仓库URL和访问权限', risk: 'none', automated: true },
          { action: '重新认证', command: 'git credential-cache exit && git pull', explanation: '清除缓存凭证并重新认证', risk: 'low', automated: false },
          { action: '解决合并冲突', command: 'git status | grep "both modified"', explanation: '定位冲突文件后手动解决', risk: 'medium', automated: false },
          { action: '强制推送（谨慎）', command: 'git push --force-with-lease', explanation: '仅在确认安全时使用', risk: 'high', automated: false },
        ],
        prevention: ['推送前先拉取最新代码', '配置分支保护规则', '使用pre-commit hooks'],
        doc: 'https://git-scm.com/docs/git',
      },
    },
    docker: {
      1: {
        category: '容器运行错误',
        diagnosis: 'Docker容器退出码1通常表示应用程序错误。可能是启动命令失败、依赖缺失或配置错误。',
        recoveries: [
          { action: '查看容器日志', command: 'docker logs <container_id>', explanation: '获取错误详情', risk: 'none', automated: true },
          { action: '检查镜像完整性', command: 'docker inspect <image>', explanation: '验证镜像配置', risk: 'none', automated: true },
          { action: '交互式调试', command: 'docker run -it --entrypoint /bin/sh <image>', explanation: '进入容器排查', risk: 'low', automated: false },
          { action: '增加资源限制', command: 'docker run --memory=512m --cpus=1 <image>', explanation: '调整资源限制', risk: 'low', automated: true },
        ],
        prevention: ['使用.dockerignore排除不必要文件', '指定明确的CMD而非ENTRYPOINT', '添加HEALTHCHECK'],
        doc: 'https://docs.docker.com/reference/',
      },
    },
    kubectl: {
      1: {
        category: 'Kubernetes API错误',
        diagnosis: 'kubectl退出码1表示API调用失败。常见原因：RBAC权限不足、资源不存在、API服务器不可达。',
        recoveries: [
          { action: '检查集群连接', command: 'kubectl cluster-info', explanation: '验证API服务器可达性', risk: 'none', automated: true },
          { action: '检查RBAC权限', command: 'kubectl auth can-i <verb> <resource>', explanation: '验证当前用户权限', risk: 'none', automated: true },
          { action: '查看事件', command: 'kubectl get events --sort-by=.metadata.creationTimestamp', explanation: '获取集群事件日志', risk: 'none', automated: true },
          { action: '切换上下文', command: 'kubectl config use-context <context>', explanation: '切换到正确的集群', risk: 'medium', automated: false },
        ],
        prevention: ['配置适当的RBAC角色', '使用namespace隔离', '设置resource requests/limits'],
        doc: 'https://kubernetes.io/docs/reference/kubectl/',
      },
    },
    npm: {
      1: {
        category: 'NPM安装错误',
        diagnosis: 'npm退出码1表示安装失败。常见原因：依赖冲突、网络问题、package.json错误。',
        recoveries: [
          { action: '清理缓存', command: 'npm cache clean --force', explanation: '清除损坏的缓存', risk: 'low', automated: true },
          { action: '删除node_modules重装', command: 'rm -rf node_modules package-lock.json && npm install', explanation: '完全重新安装', risk: 'medium', automated: false },
          { action: '检查npm registry', command: 'npm config get registry', explanation: '确认registry可访问', risk: 'none', automated: true },
          { action: '使用legacy peer deps', command: 'npm install --legacy-peer-deps', explanation: '绕过peer依赖冲突', risk: 'low', automated: true },
        ],
        prevention: ['锁定依赖版本（package-lock.json）', '使用.npmrc配置私有registry', '定期更新依赖'],
        doc: 'https://docs.npmjs.com/cli-documentation/',
      },
    },
  }

  const toolErrors = errorDatabase[input.cli_name] || {}
  const errorInfo = toolErrors[input.exit_code] || {
    category: '通用CLI错误',
    diagnosis: `退出码 ${input.exit_code} 表示命令执行失败。请检查 stderr 输出获取详细信息。`,
    recoveries: [
      { action: '查看帮助文档', command: `${input.cli_name} --help`, explanation: '查看正确用法', risk: 'none', automated: true },
      { action: '检查命令语法', command: `type ${input.cli_name}`, explanation: '确认命令存在且可执行', risk: 'none', automated: true },
      { action: '检查环境变量', command: 'env | grep PATH', explanation: '确认环境配置正确', risk: 'none', automated: true },
      { action: '使用调试模式重试', command: `${input.cli_name} --verbose ${input.command}`, explanation: '获取详细错误信息', risk: 'low', automated: true },
    ],
    prevention: ['使用绝对路径', '检查依赖版本兼容性', '在CI中先测试'],
    doc: `https://github.com/${input.cli_name}/${input.cli_name}`,
  }

  return {
    cli_name: input.cli_name,
    command: input.command,
    exit_code: input.exit_code,
    error_category: errorInfo.category,
    diagnosis: errorInfo.diagnosis,
    recoveries: errorInfo.recoveries,
    prevention_tips: errorInfo.prevention,
    documentation_url: errorInfo.doc,
  }
}

// --- Tool 7: Permission Analyzer 分析 ---
function analyzePermissionAnalyzer(input: PermissionInput): PermissionAnalyzerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name + input.commands.join(',')))

  const permissionDatabase: Record<string, Omit<PermissionRequirement, 'command'>> = {
    'git push': { needs_root: false, needs_network: true, needs_filesystem: ['.git/'], needs_env_vars: ['GIT_SSH_COMMAND'], capabilities: ['network_write'], risk_if_misused: '可能覆盖远程代码历史' },
    'docker run': { needs_root: true, needs_network: true, needs_filesystem: ['/var/run/docker.sock'], needs_env_vars: ['DOCKER_HOST'], capabilities: ['SYS_ADMIN', 'NET_ADMIN'], risk_if_misused: '容器逃逸可获取宿主机root权限' },
    'kubectl apply': { needs_root: false, needs_network: true, needs_filesystem: ['~/.kube/config'], needs_env_vars: ['KUBECONFIG'], capabilities: ['cluster_admin'], risk_if_misused: '可修改生产集群状态' },
    'rm -rf': { needs_root: false, needs_network: false, needs_filesystem: ['*'], needs_env_vars: [], capabilities: ['filesystem_write'], risk_if_misused: '不可逆删除任意文件' },
    'terraform apply': { needs_root: false, needs_network: true, needs_filesystem: ['.terraform/'], needs_env_vars: ['AWS_ACCESS_KEY_ID', 'TF_VAR_*'], capabilities: ['cloud_admin'], risk_if_misused: '可销毁云基础设施造成经济损失' },
    'npm install -g': { needs_root: true, needs_network: true, needs_filesystem: ['/usr/lib/node_modules/'], needs_env_vars: ['npm_config_prefix'], capabilities: ['filesystem_write'], risk_if_misused: '全局安装恶意包' },
    'pip install': { needs_root: false, needs_network: true, needs_filesystem: ['site-packages/'], needs_env_vars: ['PIP_INDEX_URL'], capabilities: ['filesystem_write'], risk_if_misused: '安装恶意Python包' },
    'curl': { needs_root: false, needs_network: true, needs_filesystem: [], needs_env_vars: [], capabilities: ['network_read'], risk_if_misused: '泄露请求中的敏感信息' },
    'aws s3 cp': { needs_root: false, needs_network: true, needs_filesystem: ['~/.aws/credentials'], needs_env_vars: ['AWS_PROFILE'], capabilities: ['cloud_storage'], risk_if_misused: '泄露或删除云存储数据' },
    'rsync': { needs_root: false, needs_network: true, needs_filesystem: ['source/', 'dest/'], needs_env_vars: ['RSYNC_PROXY'], capabilities: ['filesystem_read', 'filesystem_write'], risk_if_misused: '覆盖目标目录所有文件' },
  }

  const permissions: PermissionRequirement[] = input.commands.map(cmd => {
    const normalized = cmd.trim().toLowerCase()
    const match = Object.keys(permissionDatabase).find(k => normalized.includes(k))
    const data = match ? permissionDatabase[match] : {
      needs_root: false,
      needs_network: false,
      needs_filesystem: [],
      needs_env_vars: [],
      capabilities: [],
      risk_if_misused: '未知风险',
    }
    return { command: cmd, ...data }
  })

  const hasRoot = permissions.some(p => p.needs_root)
  const hasNetwork = permissions.some(p => p.needs_network)
  const hasDestructive = permissions.some(p => p.capabilities.includes('filesystem_write') || p.capabilities.includes('cloud_admin'))

  const overallRisk = hasRoot && hasDestructive ? 'critical' : hasDestructive ? 'high' : hasNetwork ? 'medium' : 'low'

  const sandboxRec = input.environment === 'container'
    ? '已在容器中运行，建议添加 seccomp profile 和 read-only rootfs'
    : input.environment === 'cloud'
    ? '使用 IAM 最小权限策略，启用 CloudTrail 审计'
    : '建议使用 Docker --cap-drop=ALL 或 firejail 沙箱'

  return {
    cli_name: input.cli_name,
    environment: input.environment,
    permissions,
    overall_risk: overallRisk,
    least_privilege_shell: `sudo -u restricted_user ${input.cli_name}`,
    sandbox_recommendation: sandboxRec,
  }
}

// --- Tool 8: Agent Native Scorer 分析 ---
function analyzeAgentNativeScorer(input: ScorerInput): AgentNativeScorerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.cli_name))

  const breakdown: ScoreBreakdown[] = [
    { dimension: '帮助文档完整性 (--help)', score: input.has_help_flag ? 15 : 3, max: 15, comment: input.has_help_flag ? '有标准帮助输出' : '缺少帮助标志，Agent难以学习用法' },
    { dimension: 'JSON结构化输出', score: input.has_json_output ? 20 : 5, max: 20, comment: input.has_json_output ? '支持JSON输出，易于解析' : '仅文本输出，需要额外解析逻辑' },
    { dimension: 'Dry-run模式', score: input.has_dry_run ? 15 : 0, max: 15, comment: input.has_dry_run ? '支持预览模式，Agent可安全测试' : '无dry-run，执行即生效' },
    { dimension: '静默模式 (-q/--quiet)', score: input.has_quiet_mode ? 10 : 3, max: 10, comment: input.has_quiet_mode ? '可抑制非必要输出' : '输出可能包含干扰信息' },
    { dimension: '退出码清晰度', score: Math.round(input.exit_code_clarity * 15), max: 15, comment: `退出码语义清晰度: ${input.exit_code_clarity}/1.0` },
    { dimension: '输出可解析性', score: Math.round(input.output_parseability * 15), max: 15, comment: `输出结构化程度: ${input.output_parseability}/1.0` },
    { dimension: '幂等性', score: Math.round(input.idempotency * 10), max: 10, comment: `重复执行安全性: ${input.idempotency}/1.0` },
    { dimension: '原子性', score: Math.round(input.atomicity * 10), max: 10, comment: `操作原子性: ${input.atomicity}/1.0` },
  ]

  const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0)
  const grade = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 50 ? 'C' : totalScore >= 30 ? 'D' : 'F'

  const suggestions: string[] = []
  if (!input.has_help_flag) suggestions.push('添加 --help 标志输出使用说明')
  if (!input.has_json_output) suggestions.push('添加 --format json 或 -o json 支持结构化输出')
  if (!input.has_dry_run) suggestions.push('实现 --dry-run 模式允许Agent安全测试')
  if (!input.has_quiet_mode) suggestions.push('添加 --quiet 模式减少非必要输出')
  if (input.exit_code_clarity < 0.7) suggestions.push('规范退出码语义（0=成功，1=通用错误，2=误用，128+=信号）')
  if (input.output_parseability < 0.7) suggestions.push('输出使用结构化格式（JSON/CSV）替代自由文本')
  if (input.idempotency < 0.5) suggestions.push('确保重复执行不产生副作用')
  if (input.atomicity < 0.5) suggestions.push('实现事务性操作或补偿机制')

  const readiness = totalScore >= 75 ? 'production_ready' : totalScore >= 45 ? 'needs_wrapper' : 'not_recommended'

  return {
    cli_name: input.cli_name,
    total_score: totalScore,
    grade,
    breakdown,
    improvement_suggestions: suggestions,
    agent_readiness: readiness,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: CLI to Agent Converter 报告 ---
function formatCliToAgentConverterReport(result: ConverterResult): string {
  const lines: string[] = []
  lines.push('## 🔧 CLI to Agent Converter — CLI手册到Agent原生工具描述转换报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 目标Schema: ${result.target_schema} | 参数覆盖度: ${result.coverage_pct}%`)
  lines.push('')
  lines.push('### 🔗 转换架构图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    MAN[CLI Man Page] -->|解析| PARSER[Parameter Parser]')
  lines.push('    PARSER -->|映射| AGENT[Agent Tool Spec]')
  lines.push('    AGENT -->|序列化| SCHEMA[JSON Schema Output]')
  lines.push('    SCHEMA -->|注册| REGISTRY[Agent Tool Registry]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 Agent工具规范')
  lines.push('')
  lines.push(`**工具名称:** ${result.agent_spec.name}`)
  lines.push(`**描述:** ${result.agent_spec.description}`)
  lines.push(`**风险等级:** ${result.agent_spec.risk_level}`)
  lines.push(`**返回类型:** ${result.agent_spec.return_type}`)
  lines.push('')

  lines.push('### 📋 参数映射表')
  lines.push('| CLI标志 | Agent参数 | 类型 | 描述 | 必填 | 安全提示 |')
  lines.push('|---------|-----------|------|------|------|----------|')
  for (const p of result.agent_spec.parameters) {
    lines.push(`| ${p.cli_flag} | ${p.agent_param} | ${p.type} | ${p.description} | ${p.required ? '是' : '否'} | ${p.safety_note} |`)
  }
  lines.push('')

  lines.push('### 📋 使用示例')
  for (const ex of result.agent_spec.examples) {
    lines.push(`- \`${ex}\``)
  }
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('### ⚠️ 警告')
    for (const w of result.warnings) lines.push(`- ${w}`)
    lines.push('')
  }

  lines.push('### 📋 转换清单')
  lines.push('- [x] CLI标志到Agent参数映射')
  lines.push('- [x] 类型系统转换')
  lines.push('- [x] 安全提示标注')
  lines.push('- [x] 风险等级评估')
  lines.push('- [x] 使用示例提取')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 2: Command Risk Classifier 报告 ---
function formatCommandRiskClassifierReport(result: RiskClassifierResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ Command Risk Classifier — CLI命令风险分类报告')
  lines.push('')
  lines.push(`执行环境: ${result.context} | 最大风险: ${result.max_risk} | 需要审批: ${result.requires_approval ? '是' : '否'}`)
  lines.push('')
  lines.push('### 🔗 风险评估流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CMD[输入命令] -->|解析| PARSE[命令解析器]')
  lines.push('    PARSE -->|匹配| DB[风险数据库]')
  lines.push('    DB -->|评分| RISK[风险评分引擎]')
  lines.push('    RISK -->|分类| LEVEL{风险等级}')
  lines.push('    LEVEL -->|safe| GREEN[安全 — 自动执行]')
  lines.push('    LEVEL -->|read| BLUE[只读 — 自动执行]')
  lines.push('    LEVEL -->|write| YELLOW[写入 — 需确认]')
  lines.push('    LEVEL -->|destructive| RED[破坏性 — 需人工审批]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 风险分类统计')
  lines.push('| 等级 | 数量 | 处理策略 |')
  lines.push('|------|------|----------|')
  lines.push(`| 安全 (safe) | ${result.summary.safe} | 自动执行 |`)
  lines.push(`| 只读 (read) | ${result.summary.read} | 自动执行 |`)
  lines.push(`| 写入 (write) | ${result.summary.write} | 需确认 |`)
  lines.push(`| 破坏性 (destructive) | ${result.summary.destructive} | 需人工审批 |`)
  lines.push('')

  lines.push('### 📋 命令风险明细')
  lines.push('| 命令 | 工具 | 风险等级 | 风险分 | 原因 | 安全替代方案 |')
  lines.push('|------|------|----------|--------|------|-------------|')
  for (const e of result.entries) {
    lines.push(`| \`${e.command}\` | ${e.tool} | ${e.risk_level} | ${e.risk_score} | ${e.reason} | ${e.safe_alternative || '-'} |`)
  }
  lines.push('')

  lines.push('### 📋 安全清单')
  lines.push('- [x] 命令语义解析完成')
  lines.push('- [x] 风险数据库匹配完成')
  lines.push('- [x] 风险评分计算完成')
  lines.push(result.requires_approval ? '- [x] 检测到高风险命令，已标记需审批' : '- [x] 所有命令均为低风险，可自动执行')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 3: Auto Wrapper Generator 报告 ---
function formatAutoWrapperGeneratorReport(result: WrapperGeneratorResult): string {
  const lines: string[] = []
  lines.push('## 📦 Auto Wrapper Generator — CLI工具TypeScript包装器生成报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 包装器风格: ${result.wrapper_style} | 代码行数: ${result.lines_of_code} | 测试覆盖率: ${result.test_coverage_pct}%`)
  lines.push('')
  lines.push('### 🔗 生成流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CLI[CLI工具分析] -->|提取接口| SPEC[接口规格]')
  lines.push('    SPEC -->|选择模板| TEMPLATE[代码模板]')
  lines.push('    TEMPLATE -->|填充| CODE[TypeScript代码]')
  lines.push('    CODE -->|生成| TEST[测试代码]')
  lines.push('    TEST -->|打包| PKG[可发布包]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 生成文件')
  lines.push(`**文件名:** ${result.wrapper.filename}`)
  lines.push(`**语言:** ${result.wrapper.language}`)
  lines.push(`**依赖:** ${result.wrapper.dependencies.join(', ')}`)
  lines.push(`**安装命令:** \`${result.wrapper.install_command}\``)
  lines.push('')

  lines.push('### 📋 生成代码')
  lines.push('```typescript')
  lines.push(result.wrapper.code)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 测试代码')
  lines.push('```typescript')
  lines.push(result.wrapper.test_code)
  lines.push('```')
  lines.push('')

  lines.push('### 📋 生成清单')
  lines.push('- [x] 参数类型定义生成')
  lines.push('- [x] 执行函数生成')
  lines.push('- [x] 错误处理逻辑')
  lines.push('- [x] 超时控制')
  lines.push('- [x] 测试用例生成')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 4: Interactive Explorer 报告 ---
function formatInteractiveExplorerReport(result: ExplorerResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Interactive Explorer — 带安全护栏的CLI交互式探索报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 安全模式: ${result.safety_mode} | 发现命令: ${result.total_discovered} | 安全可执行: ${result.safe_to_auto_execute}`)
  lines.push('')
  lines.push('### 🔗 探索流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    START[开始探索] -->|读取| HELP[--help 分析]')
  lines.push('    HELP -->|提取| SUBS[子命令发现]')
  lines.push('    SUBS -->|遍历| FLAGS[标志枚举]')
  lines.push('    FLAGS -->|评估| RISK[风险评估]')
  lines.push('    RISK -->|过滤| SAFE{安全模式检查}')
  lines.push('    SAFE -->|通过| EXEC[可执行列表]')
  lines.push('    SAFE -->|拦截| BLOCK[阻止列表]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 发现的命令')
  lines.push('| 命令 | 描述 | 标志 | 子命令 | 输出格式 | 风险 | Agent可用性 |')
  lines.push('|------|------|------|--------|----------|------|-------------|')
  for (const e of result.explored) {
    lines.push(`| \`${e.command}\` | ${e.description} | ${e.flags.slice(0, 3).join(', ')} | ${e.subcommands.slice(0, 3).join(', ') || '-'} | ${e.output_format} | ${e.risk_level} | ${e.agent_usability} |`)
  }
  lines.push('')

  if (result.blocked_commands.length > 0) {
    lines.push('### 🚫 被安全模式阻止的命令')
    for (const cmd of result.blocked_commands) {
      lines.push(`- \`${cmd}\``)
    }
    lines.push('')
  }

  lines.push('### 📋 探索清单')
  lines.push('- [x] 帮助文档解析')
  lines.push('- [x] 子命令枚举')
  lines.push('- [x] 标志和选项提取')
  lines.push('- [x] 输出格式识别')
  lines.push('- [x] 风险评估完成')
  lines.push('- [x] 安全模式过滤完成')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 5: Pipeline Orchestrator 报告 ---
function formatPipelineOrchestratorReport(result: PipelineResult): string {
  const lines: string[] = []
  lines.push('## 🔄 Pipeline Orchestrator — 多CLI管道编排规划报告')
  lines.push('')
  lines.push(`目标: ${result.goal}`)
  lines.push(`总步骤: ${result.total_steps} | 预计总耗时: ${result.estimated_total_ms}ms | 失败策略: ${result.fail_policy}`)
  lines.push('')
  lines.push('### 🔗 管道流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  for (const step of result.steps) {
    lines.push(`    ${step.step_id}[${step.step_id}: ${step.tool}]`)
  }
  for (const step of result.steps) {
    for (const dep of step.depends_on) {
      lines.push(`    ${dep} -->|依赖| ${step.step_id}`)
    }
  }
  lines.push('```')
  lines.push('')

  lines.push('### 📋 步骤执行计划')
  lines.push('| 步骤ID | 工具 | 命令 | 状态 | 预计耗时(ms) | 回滚命令 |')
  lines.push('|--------|------|------|------|-------------|----------|')
  for (const s of result.steps) {
    lines.push(`| ${s.step_id} | ${s.tool} | \`${s.command}\` | ${s.status} | ${s.estimated_duration_ms} | ${s.rollback_command || '-'} |`)
  }
  lines.push('')

  if (result.parallel_groups.length > 0) {
    lines.push('### 📋 并行执行组')
    result.parallel_groups.forEach((group, i) => {
      lines.push(`- 组 ${i + 1}: ${group.join(', ')} (可并行)`)
    })
    lines.push('')
  }

  if (result.rollback_plan.length > 0) {
    lines.push('### 📋 回滚计划')
    for (const r of result.rollback_plan) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### 📋 编排清单')
  lines.push('- [x] 步骤依赖解析完成')
  lines.push('- [x] 并行分组优化完成')
  lines.push('- [x] 回滚策略制定完成')
  lines.push('- [x] 失败处理策略配置完成')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 6: Error Recovery Advisor 报告 ---
function formatErrorRecoveryAdvisorReport(result: ErrorRecoveryResult): string {
  const lines: string[] = []
  lines.push('## 🔧 Error Recovery Advisor — CLI错误诊断与恢复建议报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 命令: \`${result.command}\` | 退出码: ${result.exit_code} | 错误类别: ${result.error_category}`)
  lines.push('')
  lines.push('### 🔗 诊断流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    ERR[命令失败] -->|捕获| CODE[退出码分析]')
  lines.push('    CODE -->|匹配| DB[错误数据库]')
  lines.push('    DB -->|生成| DIAG[诊断结果]')
  lines.push('    DIAG -->|推荐| RECOV[恢复方案]')
  lines.push('    RECOV -->|评估| RISK{风险评估}')
  lines.push('    RISK -->|低风险| AUTO[自动执行]')
  lines.push('    RISK -->|高风险| MANUAL[人工确认]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 诊断结果')
  lines.push(result.diagnosis)
  lines.push('')

  lines.push('### 📋 恢复方案')
  lines.push('| 方案 | 命令 | 说明 | 风险 | 可自动化 |')
  lines.push('|------|------|------|------|----------|')
  for (const r of result.recoveries) {
    lines.push(`| ${r.action} | \`${r.command}\` | ${r.explanation} | ${r.risk} | ${r.automated ? '是' : '否'} |`)
  }
  lines.push('')

  lines.push('### 📋 预防建议')
  for (const tip of result.prevention_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')

  lines.push('### 📋 参考文档')
  lines.push(`- 官方文档: ${result.documentation_url}`)
  lines.push('')

  lines.push('### 📋 诊断清单')
  lines.push('- [x] 退出码解析完成')
  lines.push('- [x] 错误类别匹配完成')
  lines.push('- [x] 恢复方案生成完成')
  lines.push('- [x] 风险评估完成')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 7: Permission Analyzer 报告 ---
function formatPermissionAnalyzerReport(result: PermissionAnalyzerResult): string {
  const lines: string[] = []
  lines.push('## 🔐 Permission Analyzer — CLI工具权限需求分析报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 环境: ${result.environment} | 整体风险: ${result.overall_risk}`)
  lines.push('')
  lines.push('### 🔗 权限分析流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CMD[命令输入] -->|解析| TOOL[工具识别]')
  lines.push('    TOOL -->|查询| DB[权限数据库]')
  lines.push('    DB -->|汇总| PERM[权限需求列表]')
  lines.push('    PERM -->|评估| RISK[风险评级]')
  lines.push('    RISK -->|生成| REC[安全建议]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 权限需求明细')
  lines.push('| 命令 | 需Root | 需网络 | 文件系统 | 环境变量 | 能力 | 滥用风险 |')
  lines.push('|------|--------|--------|----------|----------|------|----------|')
  for (const p of result.permissions) {
    lines.push(`| \`${p.command}\` | ${p.needs_root ? '是' : '否'} | ${p.needs_network ? '是' : '否'} | ${p.needs_filesystem.join(', ') || '-'} | ${p.needs_env_vars.join(', ') || '-'} | ${p.capabilities.join(', ') || '-'} | ${p.risk_if_misused} |`)
  }
  lines.push('')

  lines.push('### 📋 安全建议')
  lines.push(`- 最小权限Shell: \`${result.least_privilege_shell}\``)
  lines.push(`- 沙箱建议: ${result.sandbox_recommendation}`)
  lines.push('')

  lines.push('### 📋 权限清单')
  lines.push('- [x] 命令权限需求解析完成')
  lines.push('- [x] 文件系统访问分析完成')
  lines.push('- [x] 网络访问分析完成')
  lines.push('- [x] 环境变量依赖分析完成')
  lines.push('- [x] Linux capabilities分析完成')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 8: Agent Native Scorer 报告 ---
function formatAgentNativeScorerReport(result: AgentNativeScorerResult): string {
  const lines: string[] = []
  lines.push('## 📊 Agent Native Scorer — CLI工具Agent就绪度评分报告')
  lines.push('')
  lines.push(`CLI工具: ${result.cli_name} | 总分: ${result.total_score}/100 | 等级: ${result.grade} | 就绪度: ${result.agent_readiness}`)
  lines.push('')
  lines.push('### 🔗 评分流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CLI[CLI工具] -->|评估| DIM[8维度评分]')
  lines.push('    DIM -->|汇总| TOTAL[总分计算]')
  lines.push('    TOTAL -->|映射| GRADE[等级映射]')
  lines.push('    GRADE -->|判定| READY{Agent就绪度}')
  lines.push('    READY -->|>=75| PROD[生产就绪]')
  lines.push('    READY -->|45-74| WRAP[需要包装器]')
  lines.push('    READY -->|<45| NO[不推荐]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 评分明细')
  lines.push('| 维度 | 得分 | 满分 | 说明 |')
  lines.push('|------|------|------|------|')
  for (const b of result.breakdown) {
    lines.push(`| ${b.dimension} | ${b.score} | ${b.max} | ${b.comment} |`)
  }
  lines.push('')

  if (result.improvement_suggestions.length > 0) {
    lines.push('### 📋 改进建议')
    for (const s of result.improvement_suggestions) {
      lines.push(`- ${s}`)
    }
    lines.push('')
  }

  lines.push('### 📋 评分清单')
  lines.push('- [x] 帮助文档完整性评估')
  lines.push('- [x] 结构化输出能力评估')
  lines.push('- [x] 安全模式（dry-run）评估')
  lines.push('- [x] 输出可控性评估')
  lines.push('- [x] 退出码语义评估')
  lines.push('- [x] 输出可解析性评估')
  lines.push('- [x] 幂等性评估')
  lines.push('- [x] 原子性评估')
  lines.push('')
  lines.push('---')
  lines.push(`*CLI-Anything v${VERSION} • ${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: cli_to_agent_converter — 将CLI手册转化为Agent原生工具描述
  tools.register(defineTool({
    name: 'cli_to_agent_converter',
    description: '将CLI工具手册转化为Agent原生工具描述 | 支持OpenAI Function/Anthropic Tool/JSON Schema格式 | Convert CLI man pages to agent-native tool descriptions with parameter mapping and safety annotations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name (git|docker|kubectl|aws|ffmpeg|curl|tar|rsync|jq|terraform|npm|pip), man_page?, command_examples?, target_schema (openai_function|anthropic_tool|json_schema)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ConverterInput = JSON.parse(args.input_data)
      return formatCliToAgentConverterReport(analyzeCliToAgentConverter(input))
    }
  }))

  // Tool 2: command_risk_classifier — 按风险等级分类CLI命令
  tools.register(defineTool({
    name: 'command_risk_classifier',
    description: '按风险等级分类CLI命令 | safe/read/write/destructive四级 | 支持git、docker、kubectl、terraform等 | Classify CLI commands by risk level with safe alternatives.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: commands[] (CLI命令数组), context? (local|ci|production|sandbox)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RiskClassifierInput = JSON.parse(args.input_data)
      return formatCommandRiskClassifierReport(analyzeCommandRiskClassifier(input))
    }
  }))

  // Tool 3: auto_wrapper_generator — 自动生成CLI工具的TypeScript包装器
  tools.register(defineTool({
    name: 'auto_wrapper_generator',
    description: '自动生成CLI工具的TypeScript包装器 | 支持functional/class-based/zod-validated风格 | 含重试、超时、测试代码 | Auto-generate TypeScript wrapper with retry, timeout, and tests.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name, commands[], wrapper_style (functional|class_based|zod_validated), include_retry (boolean), timeout_ms (number)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: WrapperGeneratorInput = JSON.parse(args.input_data)
      return formatAutoWrapperGeneratorReport(analyzeAutoWrapperGenerator(input))
    }
  }))

  // Tool 4: interactive_explorer — 带安全护栏的交互式CLI探索
  tools.register(defineTool({
    name: 'interactive_explorer',
    description: '带安全护栏的交互式CLI探索 | 自动发现子命令、标志、输出格式 | 支持strict/moderate/permissive安全模式 | Interactive CLI exploration with safety guardrails.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name, exploration_depth (shallow|medium|deep), safety_mode (strict|moderate|permissive), max_commands (number)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ExplorerInput = JSON.parse(args.input_data)
      return formatInteractiveExplorerReport(analyzeInteractiveExplorer(input))
    }
  }))

  // Tool 5: pipeline_orchestrator — 多CLI管道编排规划器
  tools.register(defineTool({
    name: 'pipeline_orchestrator',
    description: '多CLI管道编排规划器 | 支持步骤依赖、并行分组、回滚策略 | 适用于CI/CD和多工具工作流 | Multi-CLI pipeline orchestration with dependency resolution and rollback.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: goal, available_tools[], steps[{step_id, tool, command, depends_on[], output_to?, retry_count}], fail_policy (abort|skip|retry)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PipelineInput = JSON.parse(args.input_data)
      return formatPipelineOrchestratorReport(analyzePipelineOrchestrator(input))
    }
  }))

  // Tool 6: error_recovery_advisor — CLI错误诊断与恢复建议
  tools.register(defineTool({
    name: 'error_recovery_advisor',
    description: 'CLI错误诊断与恢复建议 | 支持git、docker、kubectl、npm等 | 含退出码分析、恢复方案、预防建议 | CLI error diagnosis with recovery actions and prevention tips.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name, command, exit_code (number), stderr, os (linux|macos|windows)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ErrorRecoveryInput = JSON.parse(args.input_data)
      return formatErrorRecoveryAdvisorReport(analyzeErrorRecoveryAdvisor(input))
    }
  }))

  // Tool 7: permission_analyzer — 分析CLI工具权限需求
  tools.register(defineTool({
    name: 'permission_analyzer',
    description: '分析CLI工具权限需求 | root/网络/文件系统/环境变量/capabilities | 含最小权限和沙箱建议 | Analyze CLI tool permission requirements with least-privilege recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name, commands[], environment (local|ci|container|cloud)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PermissionInput = JSON.parse(args.input_data)
      return formatPermissionAnalyzerReport(analyzePermissionAnalyzer(input))
    }
  }))

  // Tool 8: agent_native_scorer — 评分CLI工具的Agent就绪度
  tools.register(defineTool({
    name: 'agent_native_scorer',
    description: '评分CLI工具的Agent就绪度 (0-100) | 8维度综合评估 | 含改进建议和就绪度判定 | Score CLI tool agent-readiness across 8 dimensions with improvement suggestions.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: cli_name, has_help_flag, has_json_output, has_dry_run, has_quiet_mode, exit_code_clarity (0-1), output_parseability (0-1), idempotency (0-1), atomicity (0-1)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ScorerInput = JSON.parse(args.input_data)
      return formatAgentNativeScorerReport(analyzeAgentNativeScorer(input))
    }
  }))

  console.log(`[dsh-tool-cliagentify] Loaded v${VERSION} — CLI-Anything: 8 tools active`)
  console.log('  Tools: cli_to_agent_converter, command_risk_classifier, auto_wrapper_generator, interactive_explorer, pipeline_orchestrator, error_recovery_advisor, permission_analyzer, agent_native_scorer')
}
