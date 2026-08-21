/**
 * A2A Agent Card Generator for DSH Plugin Toolkit
 *
 * Scans all dsh-tool-* directories in the parent workspace, parses their
 * cordis.yml manifests, extracts tool descriptions from src/index.ts,
 * and produces A2A v1.0-compliant AgentCard JSON files.
 *
 * Usage:
 *   npx tsx generate.ts
 *
 * Output:
 *   cards/<plugin-name>.json  — one AgentCard per plugin
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AgentCard, AgentSkill, CordisManifest, ToolDescriptor } from './schema.js'

// =============================================================================
// Paths
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORKSPACE_ROOT = resolve(__dirname, '..')
const CARDS_DIR = join(__dirname, 'cards')

// =============================================================================
// Custom cordis.yml parser
// =============================================================================

/**
 * Type-safe field assignment for CordisManifest.
 * Handles the union-typed `tools` field (string | string[]) and all string fields.
 */
function setManifestField(manifest: CordisManifest, key: string, value: string): void {
  switch (key) {
    case 'id':
      manifest.id = value
      break
    case 'name':
      manifest.name = value
      break
    case 'version':
      manifest.version = value
      break
    case 'description':
      manifest.description = value
      break
    case 'author':
      manifest.author = value
      break
    case 'tools':
      manifest.tools = value
      break
    default:
      // Unknown field — store as string (tools defaults to string when not a list)
      manifest.tools = value
      break
  }
}

function parseCordisYml(raw: string): CordisManifest {
  const lines = raw.split('\n')

  const manifest: CordisManifest = {
    id: '',
    name: '',
    version: '',
    description: '',
    author: '',
    tools: [],
  }

  let currentKey: string | null = null
  let multilineBuffer: string[] = []
  let listBuffer: string[] = []
  let mode: 'normal' | 'multiline' | 'list' = 'normal'
  let multilineIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim() === '' || /^\s*#/.test(line)) continue

    // List-item start: "- id: value" or "- name: value" (YAML array element)
    const listItemMatch = line.match(/^- (\w+):\s*(.*?)\s*(?:#.*)?$/)
    if (listItemMatch) {
      const key = listItemMatch[1]
      const val = listItemMatch[2]
      if (key === 'id') {
        manifest.id = val
      } else {
        setManifestField(manifest, key, val)
      }
      continue
    }

    // Standard "key: value" — works for both flat and nested formats
    const kvMatch = line.match(/^(\s*)(\w+):\s*(.*?)\s*(?:#.*)?$/)
    if (kvMatch) {
      const indent = kvMatch[1]
      const key = kvMatch[2]
      const trimmedVal = kvMatch[3].trim()

      // Flush any pending buffers before starting a new field
      if (mode === 'multiline' && indent.length <= multilineIndent && trimmedVal !== '') {
        manifest.description = multilineBuffer.join('\n')
        mode = 'normal'
        multilineBuffer = []
        currentKey = null
      }

      if (mode === 'list' && indent.length <= multilineIndent) {
        manifest.tools = listBuffer
        mode = 'normal'
        listBuffer = []
        currentKey = null
      }

      if (trimmedVal === '|') {
        // Block scalar (multi-line description)
        mode = 'multiline'
        currentKey = key
        multilineIndent = indent.length
        multilineBuffer = []
      } else if (trimmedVal === '') {
        // Could be a list or sub-object; for cordis.yml we expect a list
        mode = 'list'
        currentKey = key
        multilineIndent = indent.length
        listBuffer = []
      } else {
        setManifestField(manifest, key, trimmedVal)
      }
      continue
    }

    // Continuation lines for block scalars
    if (mode === 'multiline') {
      const stripped = line.replace(new RegExp('^\\s{' + (multilineIndent + 2) + '}'), '')
      multilineBuffer.push(stripped)
      continue
    }

    // Continuation lines for lists
    if (mode === 'list') {
      const itemMatch = line.match(/^\s+-\s+(.+?)\s*(?:#.*)?$/)
      if (itemMatch) {
        listBuffer.push(itemMatch[1].trim())
      }
      continue
    }
  }

  // Flush remaining buffers
  if (mode === 'multiline' && currentKey && currentKey === 'description') {
    manifest.description = multilineBuffer.join('\n')
  }
  if (mode === 'list' && currentKey && currentKey === 'tools') {
    manifest.tools = listBuffer
  }

  return manifest
}

/**
 * Some cordis.yml files store tools as a count ("tools: 8") rather than a list.
 * This detects that case and signals that tools should be sourced from code.
 */
function toolsNeedSourceFallback(manifest: CordisManifest): boolean {
  if (typeof manifest.tools === 'string') return true
  if (manifest.tools.length === 0) return true
  // If the only entry is a numeric string like "8", it's a count, not a list
  if (manifest.tools.length === 1 && /^\d+$/.test(manifest.tools[0])) return true
  return false
}

/** Return the tool list from a manifest that has an enumerated tools list */
function getToolList(manifest: CordisManifest): string[] {
  if (typeof manifest.tools === 'string') return []
  return manifest.tools
}

/**
 * Extract ALL tools from a plugin's src/index.ts (no filtering by id).
 * Used when cordis.yml doesn't enumerate tools individually.
 * We pass an empty array to extractToolDescriptions so it accepts every
 * defineTool block it finds.
 */
function discoverAllToolsFromSource(pluginDir: string): ToolDescriptor[] {
  return extractToolDescriptions(pluginDir, [])
}

// =============================================================================
// Source code tool-description extraction
// =============================================================================

function extractToolDescriptions(pluginDir: string, toolIds: string[]): ToolDescriptor[] {
  const indexPath = join(pluginDir, 'src', 'index.ts')
  if (!existsSync(indexPath)) {
    return toolIds.map((id) => ({
      id,
      name: humanizeName(id),
      description: 'Tool provided by the ' + humanizeName(id) + ' module.',
      inputParams: [],
    }))
  }

  const source = readFileSync(indexPath, 'utf-8')
  const descriptors: ToolDescriptor[] = []

  // Match defineTool({ ... }) blocks — handles multi-line via the s flag.
  // Variants seen in the codebase:
  //   tools.register(defineTool({...}))           — single-line call
  //   tools.register(\n    defineTool({...}\n    }),\n  )  — multi-line w/ trailing comma
  // The regex handles both by allowing whitespace between register( and defineTool(
  // and an optional comma before the closing ) of tools.register().
  const blockRegex = /tools\.register\(\s*defineTool\(\s*\{[\s\S]*?\}\s*\),?\s*\)/g
  let blockMatch: RegExpExecArray | null

  while ((blockMatch = blockRegex.exec(source)) !== null) {
    const blockContent = blockMatch[0]

    // Accept both single- and double-quoted names and descriptions
    const nameMatch = blockContent.match(/name:\s*["']([^"']+)["']/)
    const descMatch = blockContent.match(/description:\s*["']([\s\S]*?)["']/s)

    if (!nameMatch) continue
    const toolId = nameMatch[1]

    // If toolIds is provided and non-empty, filter; otherwise accept all
    if (toolIds.length > 0 && !toolIds.includes(toolId)) continue

    const description = descMatch ? descMatch[1] : 'Tool: ' + humanizeName(toolId)

    // Extract parameter names from the parameters block (exclude the
    // "parameters" field itself by only looking after the opening brace)
    const paramsMatch = blockContent.match(/parameters:\s*\{([\s\S]*?)\n\s{4}\}/)
    const inputParams: string[] = []
    if (paramsMatch) {
      const paramNameRegex = /(\w+):\s*\{/g
      let pMatch: RegExpExecArray | null
      while ((pMatch = paramNameRegex.exec(paramsMatch[1])) !== null) {
        inputParams.push(pMatch[1])
      }
    }

    descriptors.push({
      id: toolId,
      name: humanizeName(toolId),
      description,
      inputParams,
    })
  }

  // Fallback: for any declared toolIds not found, add a placeholder descriptor
  for (const id of toolIds) {
    if (!descriptors.find((d) => d.id === id)) {
      descriptors.push({
        id,
        name: humanizeName(id),
        description: 'Tool provided by the ' + humanizeName(id) + ' module.',
        inputParams: [],
      })
    }
  }

  return descriptors
}

// =============================================================================
// Name & example helpers
// =============================================================================

function humanizeName(id: string): string {
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function generateExamples(descriptor: ToolDescriptor, pluginName: string): string[] {
  const { name, description, inputParams } = descriptor

  // Normalize description so the example sentence reads naturally
  const normalizedDesc = description.endsWith('.')
    ? description.slice(0, -1)
    : description

  const examples: string[] = []
  examples.push('Use ' + name + ' to ' + normalizedDesc.charAt(0).toLowerCase() + normalizedDesc.slice(1) + '.')

  if (inputParams.length > 0) {
    const primaryParam = humanizeName(inputParams[0])
    examples.push('Can you run ' + name + '? ' + primaryParam + ' is the main input I have.')
  } else {
    examples.push('I need ' + name + ' capabilities for this task in ' + pluginName + '.')
  }

  examples.push('Invoke ' + name + ' with the relevant data and return the formatted result.')

  return examples
}

function deriveTags(pluginId: string, toolName: string): string[] {
  const tags: string[] = []
  const pluginTag = pluginId.replace(/^dsh-tool-/, '').replace(/-/g, ' ')
  if (pluginTag) tags.push(pluginTag)

  const toolWords = toolName.split(/\s+/)
  for (const w of toolWords) {
    const lower = w.toLowerCase()
    if (lower.length > 2 && !tags.includes(lower)) {
      tags.push(lower)
    }
  }

  return tags
}

// =============================================================================
// AgentCard assembly
// =============================================================================

function buildAgentCard(manifest: CordisManifest, tools: ToolDescriptor[], pluginDir: string): AgentCard {
  const skills: AgentSkill[] = tools.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    tags: deriveTags(manifest.id, t.name),
    examples: generateExamples(t, manifest.name),
    inputModes: ['text/plain'],
    outputModes: ['text/plain'],
  }))

  const lowerDesc = manifest.description.toLowerCase()
  const capabilities = {
    streaming: true,
    pushNotifications: lowerDesc.includes('coordinat') || lowerDesc.includes('orchestrat'),
    stateTransitionHistory: true,
    delegation: lowerDesc.includes('multi-agent'),
    skillDiscovery: true,
  }

  return {
    name: manifest.name,
    description: manifest.description,
    url: 'https://dsh-plugin-toolkit.dev/.well-known/agent.json/' + manifest.name,
    version: manifest.version,
    documentationUrl: 'https://github.com/dsh-plugins/' + manifest.name,
    capabilities,
    authentication: {
      schemes: ['bearer'],
    },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills,
  }
}

// =============================================================================
// Main generator
// =============================================================================

function main(): void {
  const startedAt = Date.now()

  mkdirSync(CARDS_DIR, { recursive: true })

  const entries = readdirSync(WORKSPACE_ROOT, { withFileTypes: true })
  const pluginDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('dsh-tool-'))
    .map((e) => e.name)
    .sort()

  console.log('\nA2A Agent Card Generator — DSH Plugin Toolkit')
  console.log('Found ' + pluginDirs.length + ' plugin directories in workspace\n')

  let generated = 0
  let skipped = 0
  const errors: Array<{ plugin: string; error: string }> = []

  for (const pluginName of pluginDirs) {
    const pluginPath = join(WORKSPACE_ROOT, pluginName)
    const cordisPath = join(pluginPath, 'cordis.yml')

    if (!existsSync(cordisPath)) {
      console.log('  SKIP  ' + pluginName + '  (no cordis.yml)')
      skipped++
      continue
    }

    try {
      const raw = readFileSync(cordisPath, 'utf-8')
      const manifest = parseCordisYml(raw)

      // Derive id/name from directory if missing
      if (!manifest.id) manifest.id = pluginName
      if (!manifest.name) manifest.name = pluginName
      if (!manifest.version) manifest.version = '1.0.0'
      if (!manifest.description) manifest.description = 'DSH plugin: ' + pluginName

      // Determine effective tools
      let tools: ToolDescriptor[]
      if (toolsNeedSourceFallback(manifest)) {
        // cordis.yml has no tool list — discover all from source
        tools = discoverAllToolsFromSource(pluginPath)
      } else {
        tools = extractToolDescriptions(pluginPath, getToolList(manifest))
      }
      const card = buildAgentCard(manifest, tools, pluginPath)

      const outPath = join(CARDS_DIR, pluginName + '.json')
      writeFileSync(outPath, JSON.stringify(card, null, 2) + '\n', 'utf-8')

      console.log('  OK    ' + pluginName + '  (' + tools.length + ' skills)')
      generated++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log('  FAIL  ' + pluginName + '  (' + message + ')')
      errors.push({ plugin: pluginName, error: message })
    }
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)

  console.log('\n' + '─'.repeat(60))
  console.log('Generated: ' + generated + '  |  Skipped: ' + skipped + '  |  Errors: ' + errors.length + '  |  ' + elapsed + 's')
  console.log('Output:    ' + CARDS_DIR)
  console.log('─'.repeat(60) + '\n')

  if (errors.length > 0) {
    console.log('Errors:')
    for (const e of errors) {
      console.log('  - ' + e.plugin + ': ' + e.error)
    }
    process.exit(1)
  }
}

main()
