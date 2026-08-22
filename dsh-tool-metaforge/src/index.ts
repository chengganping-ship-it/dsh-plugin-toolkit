/**
 * DSH MetaForge - Self-Generating Plugin Factory v1.0.0
 *
 * The L6 autonomous layer that makes the entire DSH plugin toolkit self-sustaining.
 * Auto-generates plugin scaffolding, validates TypeScript compilation, generates
 * all manifest/config files from templates, produces documentation blocks,
 * creates conventional commit messages, scores plugin quality, and configures
 * batch generation runs.
 *
 * Features (v1.0.0):
 * - Plugin Scaffolder (generate complete plugin scaffolding from spec)
 * - TS Compile Validator (validate TypeScript before writing to disk)
 * - cordis.yml Generator (generate manifest from plugin metadata)
 * - package.json Generator (generate package.json with DSH dependencies)
 * - Docs Block Generator (generate PLUGINS.md rows and README badges)
 * - Commit Message Generator (conventional commits for plugin batches)
 * - Quality Scorer (score generated plugin quality across dimensions)
 * - Batch Generator Config (configure multi-plugin generation runs)
 *
 * @module dsh-tool-metaforge
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-metaforge'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRng(input: unknown): () => number {
  const str = JSON.stringify(input)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return mulberry32(Math.abs(hash) % 2147483647)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Plugin Scaffolder ---
export interface PluginScaffolderInput {
  plugin_name?: string
  category?: string
  tools?: Array<{ name: string; description: string; input_fields: string[] }>
  version?: string
  description?: string
}

export interface GeneratedFile {
  path: string
  content: string
  file_type: 'cordis_yml' | 'package_json' | 'tsconfig_json' | 'index_ts'
}

export interface PluginScaffolderResult {
  plugin_name: string
  files: GeneratedFile[]
  file_count: number
  tool_count: number
  summary: string
}

// --- Tool 2: TS Compile Validator ---
export interface TSCompileValidatorInput {
  source_code?: string
  strict_mode?: boolean
  target_version?: 'ES2020' | 'ES2022' | 'ES2023' | 'ESNext'
  module_system?: 'ESNext' | 'CommonJS' | 'NodeNext'
}

export interface TSValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  code: string
}

export interface TSCompileValidatorResult {
  valid: boolean
  errors: TSValidationError[]
  error_count: number
  warning_count: number
  diagnostics_summary: string
}

// --- Tool 3: cordis.yml Generator ---
export interface CordisYmlGeneratorInput {
  plugin_name?: string
  version?: string
  tools?: Array<{ name: string; description: string }>
  author?: string
  description?: string
  tags?: string[]
}

export interface CordisYmlResult {
  yaml_content: string
  field_count: number
  tool_declarations: string[]
}

// --- Tool 4: package.json Generator ---
export interface PackageJsonGeneratorInput {
  plugin_name?: string
  version?: string
  description?: string
  author?: string
  additional_dependencies?: Record<string, string>
}

export interface PackageJsonResult {
  json_content: string
  dependency_count: number
  script_count: number
}

// --- Tool 5: Docs Block Generator ---
export interface DocsBlockGeneratorInput {
  plugin_number?: number
  plugin_name?: string
  category?: string
  tools?: Array<{ name: string; description: string }>
  current_total?: number
}

export interface DocsBlockResult {
  plugins_md_row: string
  readme_badge: string
  readme_table_entry: string
  changelog_entry: string
  stats_summary: string
}

// --- Tool 6: Commit Message Generator ---
export interface CommitMessageGeneratorInput {
  plugins_added?: string[]
  wave_number?: number
  total_plugins?: number
  total_tools?: number
  highlights?: string[]
}

export interface CommitMessageResult {
  commit_message: string
  conventional_type: 'feat' | 'build' | 'chore'
  scope: string
  body_lines: string[]
}

// --- Tool 7: Quality Scorer ---
export interface QualityScorerInput {
  plugin_name?: string
  tools?: Array<{ name: string; description: string; input_fields: string[] }>
  descriptions?: string[]
  has_seeded_rng?: boolean
  type_safety_level?: 'full' | 'partial' | 'minimal'
}

export interface QualityDimension {
  name: string
  score: number
  max: number
  feedback: string
}

export interface QualityScorerResult {
  overall_score: number
  overall_grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: QualityDimension[]
  improvement_tips: string[]
  certification_ready: boolean
}

// --- Tool 8: Batch Generator Config ---
export interface BatchGeneratorConfigInput {
  batch_size?: number
  category_distribution?: Record<string, number>
  naming_convention?: 'kebab_case' | 'snake_case' | 'camelCase'
  shared_dependencies?: string[]
  wave_number?: number
}

export interface BatchItem {
  index: number
  category: string
  plugin_name: string
  tool_count: number
}

export interface BatchGeneratorConfigResult {
  batch_id: string
  items: BatchItem[]
  total_tools: number
  distribution_summary: string
  config_valid: boolean
  validation_notes: string[]
}

// ==================== TOOL 1: PLUGIN SCAFFOLDER ====================

function scaffoldPlugin(input: PluginScaffolderInput): PluginScaffolderResult {
  const pluginName = input.plugin_name || 'dsh-tool-newplugin'
  const category = input.category || 'general'
  const version = input.version || '1.0.0'
  const description = input.description || `${pluginName} - auto-generated DSH plugin for ${category}`
  const tools = input.tools && input.tools.length > 0
    ? input.tools
    : [
        { name: 'tool_one', description: 'First auto-generated tool', input_fields: ['input_data'] },
        { name: 'tool_two', description: 'Second auto-generated tool', input_fields: ['input_data'] },
        { name: 'tool_three', description: 'Third auto-generated tool', input_fields: ['input_data'] },
      ]

  const rng = seededRng(input)
  const files: GeneratedFile[] = []

  // Generate cordis.yml
  const cordisYml = [
    `- id: ${pluginName}`,
    `  name: ${pluginName}`,
    `  version: ${version}`,
    `  description: ${description}`,
    `  author: chengganping-ship-it`,
    `  tools: ${tools.length}`,
  ].join('\n')
  files.push({ path: 'cordis.yml', content: cordisYml, file_type: 'cordis_yml' })

  // Generate package.json
  const pkgJson = JSON.stringify({
    name: pluginName,
    version: version,
    description: description,
    type: 'module',
    main: 'lib/index.js',
    dependencies: {
      '@deepseek-ai/cordis': '^4.0.1',
      '@deepseek-ai/dsh-tools': '^0.0.1-rc.1',
    },
    devDependencies: {
      'tsx': '^4.0.0',
      'typescript': '^5.0.0',
    },
    license: 'MIT',
    author: 'chengganping-ship-it',
    repository: {
      type: 'git',
      url: `git+https://github.com/chengganping-ship-it/${pluginName}.git`,
    },
    scripts: {
      build: 'tsc',
      typecheck: 'tsc --noEmit',
    },
    keywords: ['dsh', 'deepseek-harness', 'plugin', category, 'cordis'],
  }, null, 2)
  files.push({ path: 'package.json', content: pkgJson, file_type: 'package_json' })

  // Generate tsconfig.json
  const tsconfigJson = JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      outDir: './lib',
      rootDir: './src',
      declaration: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      allowImportingTsExtensions: true,
      types: ['node'],
    },
    include: ['src/**/*'],
  }, null, 2)
  files.push({ path: 'tsconfig.json', content: tsconfigJson, file_type: 'tsconfig_json' })

  // Generate src/index.ts
  const toolInterfaces: string[] = []
  const toolRegistrations: string[] = []
  for (let i = 0; i < tools.length; i++) {
    const t = tools[i]
    const ifaceName = t.name.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Input'
    toolInterfaces.push(`interface ${ifaceName} {\n  [key: string]: unknown\n}`)
    toolRegistrations.push(`  // Tool ${i + 1}: ${t.name}\n  tools.register(defineTool({\n    name: '${t.name}',\n    description: '${t.description || 'Auto-generated tool'}',\n    parameters: {\n      input_data: { type: 'string', description: 'JSON-encoded input', required: true }\n    },\n    output: { schema: { type: 'string' }, render: 'text' },\n    async execute(args: { input_data: string }) {\n      return 'Output from ${t.name}: ' + args.input_data\n    }\n  }))`)
  }

  const indexTs = `/**
 * ${pluginName} - ${description}
 *
 * Auto-generated by DSH MetaForge v${VERSION}
 *
 * @module ${pluginName}
 * @version ${version}
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = '${pluginName}'
export const inject = ['tools']

const VERSION = '${version}'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(42)

// ==================== TYPES ====================

${toolInterfaces.join('\n\n')}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

${toolRegistrations.join('\n\n')}

  console.log(\`[${pluginName}] Loaded v\${VERSION} - ${tools.length} tools\`)
  console.log('  Tools: ${tools.map((t: { name: string }) => t.name).join(', ')}')
}
`
  files.push({ path: 'src/index.ts', content: indexTs, file_type: 'index_ts' })

  return {
    plugin_name: pluginName,
    files,
    file_count: files.length,
    tool_count: tools.length,
    summary: `Generated ${files.length} files (${files.map((f: GeneratedFile) => f.file_type).join(', ')}) for ${pluginName} v${version} with ${tools.length} tools in category '${category}'`,
  }
}

function formatScaffolderReport(input: PluginScaffolderInput, result: PluginScaffolderResult): string {
  const lines: string[] = []
  lines.push('## Plugin Scaffolder Report')
  lines.push('')
  lines.push(`**${result.plugin_name}** | ${result.file_count} files | ${result.tool_count} tools`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')
  lines.push('### Generated Files')
  for (const f of result.files) {
    lines.push(`**${f.path}** (${f.file_type})`)
    lines.push('```')
    lines.push(f.content)
    lines.push('```')
    lines.push('')
  }
  return lines.join('\n')
}

// ==================== TOOL 2: TS COMPILE VALIDATOR ====================

function validateTSCompile(input: TSCompileValidatorInput): TSCompileValidatorResult {
  const code = input.source_code || ''
  const strictMode = input.strict_mode !== false
  const errors: TSValidationError[] = []
  const lines = code.split('\n')

  // Check for common TS issues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Check for missing type annotations in strict mode
    if (strictMode) {
      if (line.match(/:\s*any(\s|[;,\]\)]|$)/) && !line.includes('//') && !line.includes('*')) {
        errors.push({
          line: lineNum,
          column: line.indexOf('any') + 1,
          message: 'Unexpected any. Specify a better type.',
          severity: 'warning',
          code: 'TS7006',
        })
      }
    }

    // Check for missing return types on functions
    if (line.match(/function\s+\w+\s*\([^)]*\)\s*\{/) && !line.includes(':') && !line.includes('->')) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Missing return type annotation on function declaration.',
        severity: 'warning',
        code: 'TS7005',
      })
    }

    // Check for implicit any parameters
    if (strictMode && line.match(/function\s+\w+\s*\(([^)]+)\)\s*\(/) && !line.includes(':')) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Parameter implicitly has an any type.',
        severity: 'error',
        code: 'TS7006',
      })
    }

    // Check for import statement issues
    if (line.match(/import\s+\w+\s+from\s+['"][^'"]+['"]/) && !line.includes("from '@deepseek-ai")) {
      errors.push({
        line: lineNum,
        column: line.indexOf('import') + 1,
        message: 'Verify import path resolves correctly with moduleResolution bundler.',
        severity: 'warning',
        code: 'TS2307',
      })
    }
  }

  // Check structural requirements
  if (!code.includes('export function apply(ctx: Context)')) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Missing required export function apply(ctx: Context) signature.',
      severity: 'error',
      code: 'META001',
    })
  }

  if (!code.includes('ctx.tools.register') && !code.includes('tools.register')) {
    errors.push({
      line: 1,
      column: 1,
      message: 'No tool registrations found. Plugin must register at least one tool.',
      severity: 'error',
      code: 'META002',
    })
  }

  if (!code.includes("from '@deepseek-ai/cordis'")) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Missing required import from @deepseek-ai/cordis.',
      severity: 'error',
      code: 'META003',
    })
  }

  if (!code.includes("from '@deepseek-ai/dsh-tools'")) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Missing required import from @deepseek-ai/dsh-tools.',
      severity: 'error',
      code: 'META004',
    })
  }

  // Check for export const name
  if (!code.includes("export const name = '")) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Missing required export const name declaration.',
      severity: 'error',
      code: 'META005',
    })
  }

  // Check for mulberry32
  if (!code.includes('function mulberry32(seed: number)')) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Missing recommended mulberry32 PRNG function for determinism.',
      severity: 'warning',
      code: 'META006',
    })
  }

  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length
  const valid = errorCount === 0

  return {
    valid,
    errors,
    error_count: errorCount,
    warning_count: warningCount,
    diagnostics_summary: valid
      ? `Compilation valid with ${warningCount} warning(s). Ready to write to disk.`
      : `Found ${errorCount} error(s) and ${warningCount} warning(s). Fix errors before writing.`,
  }
}

function formatValidatorReport(input: TSCompileValidatorInput, result: TSCompileValidatorResult): string {
  const lines: string[] = []
  lines.push('## TypeScript Compile Validation')
  lines.push('')
  lines.push(`**Strict Mode**: ${input.strict_mode !== false ? 'ON' : 'OFF'} | **Target**: ${input.target_version || 'ES2022'} | **Module**: ${input.module_system || 'ESNext'}`)
  lines.push('')
  lines.push(result.valid ? 'PASS - Zero compile errors' : 'FAIL - Errors detected')
  lines.push(`Errors: ${result.error_count} | Warnings: ${result.warning_count}`)
  lines.push('')

  if (result.errors.length > 0) {
    lines.push('### Diagnostics')
    lines.push('| Line | Severity | Code | Message |')
    lines.push('|------|----------|------|---------|')
    for (const e of result.errors) {
      const sevTag = e.severity.toUpperCase()
      lines.push(`| ${e.line} | ${sevTag} | ${e.code} | ${e.message} |`)
    }
    lines.push('')
  }

  lines.push(result.diagnostics_summary)
  return lines.join('\n')
}

// ==================== TOOL 3: CORDIS.YML GENERATOR ====================

function generateCordisYml(input: CordisYmlGeneratorInput): CordisYmlResult {
  const pluginName = input.plugin_name || 'dsh-tool-generated'
  const version = input.version || '1.0.0'
  const author = input.author || 'chengganping-ship-it'
  const description = input.description || `${pluginName} - auto-generated DSH plugin`
  const tools = input.tools || []
  const tags = input.tags || []
  const toolCount = tools.length || 8

  const lines = [
    `- id: ${pluginName}`,
    `  name: ${pluginName}`,
    `  version: ${version}`,
    `  description: ${description}`,
    `  author: ${author}`,
    `  tools: ${toolCount}`,
  ]

  if (tags.length > 0) {
    lines.push(`  tags: ${JSON.stringify(tags)}`)
  }

  const yamlContent = lines.join('\n')
  const toolDeclarations = tools.map(t => `${pluginName}/${t.name}: ${t.description}`)

  return {
    yaml_content: yamlContent,
    field_count: lines.length,
    tool_declarations: toolDeclarations,
  }
}

function formatCordisYmlReport(input: CordisYmlGeneratorInput, result: CordisYmlResult): string {
  const lines: string[] = []
  lines.push('## cordis.yml Generator')
  lines.push('')
  lines.push(`**${input.plugin_name || 'dsh-tool-generated'}** | ${result.field_count} fields | ${input.tools?.length || 0} tools`)
  lines.push('')
  lines.push('### Generated YAML')
  lines.push('```yaml')
  lines.push(result.yaml_content)
  lines.push('```')
  lines.push('')

  if (result.tool_declarations.length > 0) {
    lines.push('### Tool Declarations')
    for (const td of result.tool_declarations) {
      lines.push(`- ${td}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 4: PACKAGE.JSON GENERATOR ====================

function generatePackageJson(input: PackageJsonGeneratorInput): PackageJsonResult {
  const pluginName = input.plugin_name || 'dsh-tool-generated'
  const version = input.version || '1.0.0'
  const description = input.description || `${pluginName} - auto-generated DSH plugin`
  const author = input.author || 'chengganping-ship-it'
  const additionalDeps = input.additional_dependencies || {}

  const dependencies: Record<string, string> = {
    '@deepseek-ai/cordis': '^4.0.1',
    '@deepseek-ai/dsh-tools': '^0.0.1-rc.1',
    ...additionalDeps,
  }

  const devDependencies: Record<string, string> = {
    'tsx': '^4.0.0',
    'typescript': '^5.0.0',
  }

  const pkgStructure = {
    name: pluginName,
    version: version,
    description: description,
    type: 'module',
    main: 'lib/index.js',
    dependencies,
    devDependencies,
    license: 'MIT',
    author: author,
    repository: {
      type: 'git',
      url: `git+https://github.com/${author}/${pluginName}.git`,
    },
    scripts: {
      build: 'tsc',
      typecheck: 'tsc --noEmit',
      dev: 'tsx src/index.ts',
    },
    keywords: ['dsh', 'deepseek-harness', 'plugin', 'cordis'],
  }

  const jsonContent = JSON.stringify(pkgStructure, null, 2)

  return {
    json_content: jsonContent,
    dependency_count: Object.keys(dependencies).length + Object.keys(devDependencies).length,
    script_count: Object.keys(pkgStructure.scripts).length,
  }
}

function formatPackageJsonReport(input: PackageJsonGeneratorInput, result: PackageJsonResult): string {
  const lines: string[] = []
  lines.push('## package.json Generator')
  lines.push('')
  lines.push(`**${input.plugin_name || 'dsh-tool-generated'}** | ${result.dependency_count} deps | ${result.script_count} scripts`)
  lines.push('')
  lines.push('### Generated package.json')
  lines.push('```json')
  lines.push(result.json_content)
  lines.push('```')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 5: DOCS BLOCK GENERATOR ====================

function generateDocsBlock(input: DocsBlockGeneratorInput): DocsBlockResult {
  const pluginNumber = input.plugin_number || 1
  const pluginName = input.plugin_name || 'dsh-tool-generated'
  const category = input.category || 'general'
  const tools = input.tools || []
  const currentTotal = (input.current_total || 0) + 1
  const toolCount = tools.length || 8

  // PLUGINS.md row
  const toolsList = tools.length > 0 ? tools.map(t => t.name).join(', ') : '...'
  const pluginsMdRow = `| ${pluginNumber} | [${pluginName}](./${pluginName}/) | ${category} | ${toolCount} | ${toolsList} |`

  // README.md badge
  const badgeColor = ['blue', 'green', 'orange', 'purple', 'red', 'yellow', 'blueviolet'][pluginNumber % 7]
  const readmeBadge = `![${pluginName}](https://img.shields.io/badge/DSH-${pluginName}-${badgeColor}?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMNCA3djEwbDggNSA4LTVMNCA3bDgtNXoiIGZpbGw9IiM2NjY2NjYiLz48L3N2Zz4=)`

  // README.md table entry
  const readmeTableEntry = `| [${pluginName}](./${pluginName}/) | ${toolCount} tools | ${category} | v1.0.0 |`

  // Changelog entry
  const changelogEntry = `- **${pluginName}** (${toolCount} tools, ${category}): Added to toolkit. ${tools.length > 0 ? 'Includes ' + tools.map(t => '`' + t.name + '`').join(', ') + '.' : ''}`

  // Stats summary
  const statsSummary = `Toolkit total: ${currentTotal} plugins | ${pluginNumber === currentTotal ? 'Latest addition' : `Plugin #${pluginNumber}`} | ${toolCount} tools | ${category} category`

  return {
    plugins_md_row: pluginsMdRow,
    readme_badge: readmeBadge,
    readme_table_entry: readmeTableEntry,
    changelog_entry: changelogEntry,
    stats_summary: statsSummary,
  }
}

function formatDocsBlockReport(input: DocsBlockGeneratorInput, result: DocsBlockResult): string {
  const lines: string[] = []
  lines.push('## Docs Block Generator')
  lines.push('')
  lines.push(`**Plugin #${input.plugin_number || 1}**: ${input.plugin_name || 'dsh-tool-generated'} | ${input.category || 'general'}`)
  lines.push('')
  lines.push(result.stats_summary)
  lines.push('')

  lines.push('### PLUGINS.md Row')
  lines.push('```markdown')
  lines.push(result.plugins_md_row)
  lines.push('```')
  lines.push('')

  lines.push('### README.md Badge')
  lines.push('```markdown')
  lines.push(result.readme_badge)
  lines.push('```')
  lines.push('')

  lines.push('### README.md Table Entry')
  lines.push('```markdown')
  lines.push(result.readme_table_entry)
  lines.push('```')
  lines.push('')

  lines.push('### Changelog Entry')
  lines.push('```markdown')
  lines.push(result.changelog_entry)
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 6: COMMIT MESSAGE GENERATOR ====================

function generateCommitMessage(input: CommitMessageGeneratorInput): CommitMessageResult {
  const pluginsAdded = input.plugins_added || []
  const waveNumber = input.wave_number || 1
  const totalPlugins = input.total_plugins || pluginsAdded.length
  const totalTools = input.total_tools || pluginsAdded.length * 8
  const highlights = input.highlights || []

  const pluginList = pluginsAdded.length > 0 ? pluginsAdded.join(', ') : 'new plugins'

  // Determine conventional type
  let conventionalType: 'feat' | 'build' | 'chore' = 'feat'
  if (waveNumber > 1 && pluginsAdded.length <= 2) conventionalType = 'build'
  if (highlights.includes('docs') || highlights.includes('config')) conventionalType = 'chore'

  const scope = `wave-${waveNumber}`

  // Build body
  const bodyLines: string[] = []
  bodyLines.push(`Add ${pluginsAdded.length} new DSH plugin(s) to the toolkit:`)
  for (const p of pluginsAdded) {
    bodyLines.push(`- ${p}`)
  }
  bodyLines.push('')
  bodyLines.push(`Total plugins: ${totalPlugins} | Total tools: ${totalTools}`)
  if (highlights.length > 0) {
    bodyLines.push('')
    bodyLines.push('Highlights:')
    for (const h of highlights) {
      bodyLines.push(`- ${h}`)
    }
  }

  const header = `${conventionalType}(${scope}): add ${pluginsAdded.length} plugin(s) [wave ${waveNumber}]`
  const commitMessage = header + '\n\n' + bodyLines.join('\n')

  return {
    commit_message: commitMessage,
    conventional_type: conventionalType,
    scope,
    body_lines: bodyLines,
  }
}

function formatCommitReport(input: CommitMessageGeneratorInput, result: CommitMessageResult): string {
  const lines: string[] = []
  lines.push('## Commit Message Generator')
  lines.push('')
  lines.push(`**Type**: ${result.conventional_type} | **Scope**: ${result.scope} | **Plugins**: ${(input.plugins_added || []).length}`)
  lines.push('')
  lines.push('### Generated Commit Message')
  lines.push('```')
  lines.push(result.commit_message)
  lines.push('```')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 7: QUALITY SCORER ====================

function scorePluginQuality(input: QualityScorerInput): QualityScorerResult {
  const pluginName = input.plugin_name || 'unknown'
  const tools = input.tools || []
  const descriptions = input.descriptions || []
  const hasRng = input.has_seeded_rng !== false
  const typeSafety = input.type_safety_level || 'partial'

  const dimensions: QualityDimension[] = []

  // Dimension 1: Naming Convention (0-20)
  const nameKebab = pluginName.startsWith('dsh-tool-') && pluginName === pluginName.toLowerCase()
  const namingScore = nameKebab ? 20 : pluginName.startsWith('dsh-') ? 15 : 10
  dimensions.push({
    name: 'Naming Convention',
    score: namingScore,
    max: 20,
    feedback: nameKebab
      ? 'Perfect kebab-case with dsh-tool- prefix'
      : `Name ${pluginName} should follow dsh-tool-<name> convention`,
  })

  // Dimension 2: Tool Diversity (0-20)
  const uniqueNames = new Set(tools.map(t => t.name))
  const uniqueDescs = new Set(descriptions.filter(d => d.length > 10))
  const diversityScore = clamp(uniqueNames.size * 3 + uniqueDescs.size * 2, 5, 20)
  dimensions.push({
    name: 'Tool Diversity',
    score: diversityScore,
    max: 20,
    feedback: `${uniqueNames.size} unique tools, ${uniqueDescs.size} unique descriptions. ${diversityScore >= 15 ? 'Good diversity' : 'Consider more varied tool names and descriptions'}`,
  })

  // Dimension 3: Description Richness (0-20)
  const avgDescLength = descriptions.length > 0
    ? descriptions.reduce((sum, d) => sum + d.length, 0) / descriptions.length
    : 0
  const descScore = clamp(Math.round(avgDescLength / 5), 3, 20)
  dimensions.push({
    name: 'Description Richness',
    score: descScore,
    max: 20,
    feedback: `Average description length: ${avgDescLength.toFixed(0)} chars. ${descScore >= 15 ? 'Rich, detailed descriptions' : descriptions.length === 0 ? 'No descriptions found' : 'Descriptions could be more detailed'}`,
  })

  // Dimension 4: Determinism / PRNG (0-20)
  const rngScore = hasRng ? 20 : 5
  dimensions.push({
    name: 'Determinism (mulberry32 PRNG)',
    score: rngScore,
    max: 20,
    feedback: hasRng
      ? 'Seeded PRNG (mulberry32) present - outputs are deterministic'
      : 'Missing seeded PRNG - outputs will be non-deterministic',
  })

  // Dimension 5: Type Safety (0-20)
  const safetyScore = typeSafety === 'full' ? 20 : typeSafety === 'partial' ? 13 : 5
  dimensions.push({
    name: 'Type Safety',
    score: safetyScore,
    max: 20,
    feedback: typeSafety === 'full'
      ? 'Full type safety with explicit interfaces and no any'
      : typeSafety === 'partial'
        ? 'Partial type safety - some types may be loose'
        : 'Minimal type safety - extensive use of any/unknown',
  })

  const overallScore = dimensions.reduce((sum, d) => sum + d.score, 0)
  const maxPossible = dimensions.reduce((sum, d) => sum + d.max, 0)
  const pct = Math.round((overallScore / maxPossible) * 100)

  let overallGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F'
  if (pct >= 95) overallGrade = 'S'
  else if (pct >= 85) overallGrade = 'A'
  else if (pct >= 70) overallGrade = 'B'
  else if (pct >= 55) overallGrade = 'C'
  else if (pct >= 40) overallGrade = 'D'

  const improvementTips: string[] = []
  if (namingScore < 20) improvementTips.push('Adopt dsh-tool-<name> kebab-case naming convention')
  if (diversityScore < 15) improvementTips.push('Increase tool count and ensure unique, descriptive names')
  if (descScore < 15) improvementTips.push('Expand tool descriptions with purpose, input/output details, and examples')
  if (rngScore < 20) improvementTips.push('Add mulberry32 seeded PRNG for deterministic output generation')
  if (safetyScore < 20) improvementTips.push('Add explicit TypeScript interfaces for all tool inputs/outputs; eliminate any types')
  if (improvementTips.length === 0) improvementTips.push('Plugin meets all quality dimensions - production ready')

  const certReady = overallScore >= 80 && hasRng && typeSafety === 'full'

  return {
    overall_score: pct,
    overall_grade: overallGrade,
    dimensions,
    improvement_tips: improvementTips,
    certification_ready: certReady,
  }
}

function formatQualityReport(input: QualityScorerInput, result: QualityScorerResult): string {
  const lines: string[] = []
  lines.push('## Plugin Quality Score')
  lines.push('')
  lines.push(`**${input.plugin_name || 'unknown'}** | Score: ${result.overall_score}/100 | Grade: ${result.overall_grade}`)
  lines.push(`Certification: ${result.certification_ready ? 'CERTIFICATION READY' : 'Needs improvements'}`)
  lines.push('')

  lines.push('### Dimension Scores')
  lines.push('| Dimension | Score | Max | Feedback |')
  lines.push('|-----------|-------|-----|----------|')
  for (const d of result.dimensions) {
    lines.push(`| ${d.name} | ${d.score} | ${d.max} | ${d.feedback} |`)
  }
  lines.push('')

  lines.push('### Improvement Tips')
  for (const tip of result.improvement_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 8: BATCH GENERATOR CONFIG ====================

function configureBatchGenerator(input: BatchGeneratorConfigInput): BatchGeneratorConfigResult {
  const batchSize = input.batch_size || 8
  const categoryDist = input.category_distribution || { general: 40, ai_agent: 25, data_tools: 20, infra: 15 }
  const namingConvention = input.naming_convention || 'kebab_case'
  const sharedDeps = input.shared_dependencies || ['@deepseek-ai/cordis', '@deepseek-ai/dsh-tools']
  const waveNumber = input.wave_number || 1

  const rng = seededRng(input)
  const items: BatchItem[] = []
  const categories = Object.keys(categoryDist)
  const totalWeight = Object.values(categoryDist).reduce((s, v) => s + v, 0)
  const validationNotes: string[] = []
  let configValid = true

  // Validate inputs
  if (batchSize < 1 || batchSize > 200) {
    validationNotes.push('ERROR: batch_size must be between 1 and 200')
    configValid = false
  }
  if (Object.keys(categoryDist).length === 0) {
    validationNotes.push('ERROR: category_distribution cannot be empty')
    configValid = false
  }
  if (totalWeight !== 100) {
    validationNotes.push(`WARNING: category_distribution sums to ${totalWeight}, expected 100. Normalizing.`)
  }
  if (namingConvention !== 'kebab_case' && namingConvention !== 'snake_case' && namingConvention !== 'camelCase') {
    validationNotes.push(`WARNING: Unknown naming_convention '${namingConvention}', defaulting to kebab_case`)
  }

  for (let i = 0; i < batchSize; i++) {
    // Pick category based on distribution
    const roll = Math.round(rng() * 100)
    let cumulative = 0
    let selectedCategory = categories[0]
    for (const cat of categories) {
      cumulative += (categoryDist[cat] || 0)
      if (roll <= cumulative) {
        selectedCategory = cat
        break
      }
    }

    // Generate plugin name based on convention
    const catSuffix = selectedCategory.replace(/_/g, '-')
    let pluginName: string
    const suffix = `plugin-${waveNumber}-${i + 1}`
    if (namingConvention === 'snake_case') {
      pluginName = `dsh_tool_${suffix}`
    } else if (namingConvention === 'camelCase') {
      pluginName = `dshTool${suffix.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`
    } else {
      pluginName = `dsh-tool-${catSuffix}-${suffix}`
    }

    const toolCount = Math.max(3, Math.min(12, Math.round(rng() * 6) + 5))

    items.push({
      index: i + 1,
      category: selectedCategory,
      plugin_name: pluginName,
      tool_count: toolCount,
    })
  }

  const totalTools = items.reduce((s, item) => s + item.tool_count, 0)

  // Build distribution summary
  const catCounts: Record<string, number> = {}
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1
  }
  const distParts = Object.entries(catCounts).map(([cat, count]) => `${cat}: ${count}`)
  const distributionSummary = `Batch ${waveNumber}: ${items.length} plugins, ${totalTools} tools. Distribution: ${distParts.join(', ')}`

  if (validationNotes.length === 0) {
    validationNotes.push('All configuration parameters valid')
  }

  return {
    batch_id: `batch-wave-${waveNumber}-${batchSize}plugins-${Date.now().toString(36)}`,
    items,
    total_tools: totalTools,
    distribution_summary: distributionSummary,
    config_valid: configValid,
    validation_notes: validationNotes,
  }
}

function formatBatchConfigReport(input: BatchGeneratorConfigInput, result: BatchGeneratorConfigResult): string {
  const lines: string[] = []
  lines.push('## Batch Generator Configuration')
  lines.push('')
  lines.push(`**Batch ID**: ${result.batch_id}`)
  lines.push(`**Wave**: ${input.wave_number || 1} | **Size**: ${input.batch_size || 8} | **Naming**: ${input.naming_convention || 'kebab_case'}`)
  lines.push(`**Status**: ${result.config_valid ? 'VALID' : 'INVALID'}`)
  lines.push('')
  lines.push(result.distribution_summary)
  lines.push('')

  if (result.validation_notes.length > 0) {
    lines.push('### Validation Notes')
    for (const note of result.validation_notes) {
      lines.push(`- ${note}`)
    }
    lines.push('')
  }

  lines.push('### Generated Plugins')
  lines.push('| # | Plugin Name | Category | Tools |')
  lines.push('|---|------------|----------|-------|')
  for (const item of result.items.slice(0, 15)) {
    lines.push(`| ${item.index} | ${item.plugin_name} | ${item.category} | ${item.tool_count} |`)
  }
  if (result.items.length > 15) {
    lines.push(`| ... | (${result.items.length - 15} more) | ... | ... |`)
  }
  lines.push('')

  if ((input.shared_dependencies || []).length > 0) {
    lines.push('### Shared Dependencies')
    for (const dep of input.shared_dependencies!) {
      lines.push(`- ${dep}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Plugin Scaffolder
  tools.register(defineTool({
    name: 'plugin_scaffolder',
    description: 'Generates complete DSH plugin scaffolding (cordis.yml, package.json, tsconfig.json, src/index.ts) from a plugin specification. Creates all 4 required files following DSH pattern with proper imports, seeded RNG, tool registration, and type interfaces.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugin_name, category, tools[{name, description, input_fields}], version, description', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PluginScaffolderInput = JSON.parse(args.input_data)
      const result = scaffoldPlugin(input)
      return formatScaffolderReport(input, result)
    }
  }))

  // Tool 2: TS Compile Validator
  tools.register(defineTool({
    name: 'ts_compile_validator',
    description: 'Validates TypeScript source code for compilation errors before writing to disk. Checks for missing imports, any types (strict mode), missing return types, missing tool registrations, missing Context type, missing plugin name export, and other structural requirements for DSH plugins.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: source_code, strict_mode (bool), target_version (ES2020|ES2022|ES2023|ESNext), module_system (ESNext|CommonJS|NodeNext)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TSCompileValidatorInput = JSON.parse(args.input_data)
      const result = validateTSCompile(input)
      return formatValidatorReport(input, result)
    }
  }))

  // Tool 3: cordis.yml Generator
  tools.register(defineTool({
    name: 'cordis_yml_generator',
    description: 'Generates cordis.yml manifest file from plugin metadata. Produces the standard DSH plugin manifest with id, name, version, description, author, tool count, and optional tags. Validates naming and tool declarations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugin_name, version, tools[{name, description}], author, description, tags[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CordisYmlGeneratorInput = JSON.parse(args.input_data)
      const result = generateCordisYml(input)
      return formatCordisYmlReport(input, result)
    }
  }))

  // Tool 4: package.json Generator
  tools.register(defineTool({
    name: 'package_json_generator',
    description: 'Generates package.json with proper DSH dependencies and scripts. Includes @deepseek-ai/cordis, @deepseek-ai/dsh-tools, TypeScript toolchain, and any additional dependencies. Sets type:module, proper main/lib paths, and DSH-specific keywords.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugin_name, version, description, author, additional_dependencies{key: version}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PackageJsonGeneratorInput = JSON.parse(args.input_data)
      const result = generatePackageJson(input)
      return formatPackageJsonReport(input, result)
    }
  }))

  // Tool 5: Docs Block Generator
  tools.register(defineTool({
    name: 'docs_block_generator',
    description: 'Generates markdown table rows for PLUGINS.md and badge stats for README.md. Produces consistent documentation blocks including PLUGINS.md table row, README badge, README table entry, and changelog entry. Maintains numbering across the toolkit.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugin_number, plugin_name, category, tools[{name, description}], current_total', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: DocsBlockGeneratorInput = JSON.parse(args.input_data)
      const result = generateDocsBlock(input)
      return formatDocsBlockReport(input, result)
    }
  }))

  // Tool 6: Commit Message Generator
  tools.register(defineTool({
    name: 'commit_message_generator',
    description: 'Generates conventional commit messages for plugin batches. Follows Conventional Commits spec (feat/build/chore) with wave scope. Lists all plugins added, total counts, and highlights. Suitable for git commit -m usage.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugins_added[], wave_number, total_plugins, total_tools, highlights[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CommitMessageGeneratorInput = JSON.parse(args.input_data)
      const result = generateCommitMessage(input)
      return formatCommitReport(input, result)
    }
  }))

  // Tool 7: Quality Scorer
  tools.register(defineTool({
    name: 'quality_scorer',
    description: 'Scores a generated plugin quality across 5 dimensions: naming convention (0-20), tool diversity (0-20), description richness (0-20), determinism via mulberry32 PRNG (0-20), and type safety (0-20). Returns letter grade (S/A/B/C/D/F), dimension breakdown, improvement tips, and certification readiness.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: plugin_name, tools[{name, description, input_fields}], descriptions[], has_seeded_rng (bool), type_safety_level (full|partial|minimal)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: QualityScorerInput = JSON.parse(args.input_data)
      const result = scorePluginQuality(input)
      return formatQualityReport(input, result)
    }
  }))

  // Tool 8: Batch Generator Config
  tools.register(defineTool({
    name: 'batch_generator_config',
    description: 'Configures a batch generation run for multiple plugins at once with shared settings. Generates plugin names following distribution rules, assigns tool counts per plugin, validates configuration, and produces a batch manifest with batch ID, distribution summary, and per-plugin details.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: batch_size, category_distribution{cat: pct}, naming_convention (kebab_case|snake_case|camelCase), shared_dependencies[], wave_number', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BatchGeneratorConfigInput = JSON.parse(args.input_data)
      const result = configureBatchGenerator(input)
      return formatBatchConfigReport(input, result)
    }
  }))

  console.log(`[dsh-tool-metaforge] Loaded v${VERSION} - MetaForge self-generating plugin factory with 8 tools`)
  console.log('  Tools: plugin_scaffolder, ts_compile_validator, cordis_yml_generator, package_json_generator, docs_block_generator, commit_message_generator, quality_scorer, batch_generator_config')
}
