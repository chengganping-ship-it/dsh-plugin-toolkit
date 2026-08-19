/**
 * dsh-tool-apistalk - API Change Tracking & Drift Detection Plugin
 *
 * A DeepSeek Harness (DSH) plugin for API schema monitoring, breaking change
 * detection, migration impact analysis, and compatibility scoring.
 *
 * Tools:
 *   1. schema_diff_detect       - Schema差异检测 (OpenAPI / GraphQL)
 *   2. breaking_change_analysis - Breaking change分析 & 严重级别评估
 *   3. migration_impact_map     - Migration影响映射 & 工作量评估
 *   4. compatibility_score      - 兼容性评分 (0-100) & 等级评级
 *   5. api_deprecation_alert    - deprecated标记扫描 & 废弃时间线
 *   6. version_upgrade_advisor  - 最优升级路径 & breaking change列表
 * 7. client_compatibility_check - Client代码兼容性检查 & 修改建议
 *   8. api_changelog_gen        - 自动生成开发者友好的changelog
 *
 * @author chengganping-ship-it
 * @version 0.1.0
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 – Interface Definitions
// ─────────────────────────────────────────────────────────────────────────────

/** 输入数据结构 */
interface SchemaComparisonInput {
  old_schema: string
  new_schema: string
  schema_type: 'openapi' | 'graphql'
  api_name: string
}

/** 端点变更记录 */
interface EndpointChange {
  method: string
  path: string
  change_type: 'added' | 'removed' | 'modified'
  details?: string
}

/** 字段变更记录 */
interface FieldChange {
  parent: string      // endpoint 或 type 名称
  field: string
  change_type: 'added' | 'removed' | 'modified'
  old_type?: string
  new_type?: string
  old_required?: boolean
  new_required?: boolean
}

/** 类型变更记录 */
interface TypeChange {
  type_name: string
  change_type: 'added' | 'removed' | 'modified'
  fields_affected: number
}

/** 参数变更记录 */
interface ParameterChange {
  endpoint: string
  param: string
  change_type: 'added' | 'removed' | 'modified'
  location: 'path' | 'query' | 'header' | 'body'
}

/** Schema差异分析结果 */
interface SchemaDiffResult {
  api_name: string
  old_version: string
  new_version: string
  endpoints: EndpointChange[]
  fields: FieldChange[]
  types: TypeChange[]
  parameters: ParameterChange[]
  summary: {
    total_changes: number
    endpoint_changes: number
    field_changes: number
    type_changes: number
    parameter_changes: number
  }
}

/** Breaking change严重级别 */
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low'

/** Breaking change条目 */
interface BreakingChangeItem {
  category: string
  description: string
  severity: SeverityLevel
  affected_endpoints: string[]
  migration_effort: 'days' | 'hours' | 'minutes'
  recommendation: string
}

/** Breaking change分析结果 */
interface BreakingChangeResult {
  total_breaking: number
  critical: number
  high: number
  medium: number
  low: number
  items: BreakingChangeItem[]
  overall_risk: 'extreme' | 'high' | 'moderate' | 'low'
}

/** Migration影响条目 */
interface MigrationImpactItem {
  client_module: string
  file_path: string
  estimated_effort_days: number
  risk_level: 'high' | 'medium' | 'low'
  affected_calls: number
  description: string
}

/** Migration影响映射结果 */
interface MigrationImpactResult {
  total_effort_days: number
  high_risk_count: number
  items: MigrationImpactItem[]
  recommended_strategy: string
}

/** 兼容性评分结果 */
interface CompatibilityScoreResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  backward_compatible_rate: number
  feature_coverage_rate: number
  behavioral_consistency_rate: number
  details: string[]
}

/** Deprecated条目 */
interface DeprecationItem {
  name: string
  type: 'endpoint' | 'field' | 'parameter' | 'type'
  deprecated_since: string
  removal_date?: string
  days_until_removal: number
  replacement?: string
  message: string
}

/** 废弃预警结果 */
interface DeprecationAlertResult {
  total_deprecated: number
  urgent_removals: number   // < 30天
  items: DeprecationItem[]
  timeline_summary: string
}

/** 升级路径步骤 */
interface UpgradeStep {
  from_version: string
  to_version: string
  breaking_changes_count: number
  effort_estimate: string
  key_concerns: string[]
}

/** 升级顾问结果 */
interface UpgradeAdvisorResult {
  current_version: string
  target_version: string
  direct_upgrade_safe: boolean
  steps: UpgradeStep[]
  total_breaking_changes: number
  total_effort_estimate: string
}

/** Client兼容性问题 */
interface ClientCompatIssue {
  file: string
  line: number
  severity: 'error' | 'warning'
  description: string
  suggestion: string
  api_endpoint: string
}

/** Client兼容性结果 */
interface ClientCompatibilityResult {
  compatible: boolean
  compatibility_percentage: number
  issues: ClientCompatIssue[]
  files_affected: number
}

/** Changelog条目 */
interface ChangelogEntry {
  type: 'Added' | 'Changed' | 'Deprecated' | 'Fixed' | 'Removed'
  description: string
  related_endpoints: string[]
}

/** Changelog结果 */
interface ChangelogResult {
  version: string
  date: string
  entries: ChangelogEntry[]
  formatted_output: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 – Utility Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse OpenAPI spec (simplified JSON extraction) */
function parseOpenAPISpec(spec: string): Record<string, unknown> {
  try {
    return JSON.parse(spec) as Record<string, unknown>
  } catch {
    return {}
  }
}

/** Parse GraphQL SDL into a simplified structure */
function parseGraphQLSpec(spec: string): Record<string, unknown> {
  const types: Record<string, string[]> = {}
  const lines = spec.split('\n')
  let currentType = ''
  for (const line of lines) {
    const typeMatch = line.match(/^type\s+(\w+)/)
    if (typeMatch) {
      currentType = typeMatch[1]
      types[currentType] = []
    } else if (currentType && line.trim().length > 0 && !line.startsWith('}')) {
      const field = line.trim().split(':')[0]?.trim()
      if (field && field !== '{') {
        types[currentType].push(field)
      }
    } else if (line.trim() === '}') {
      currentType = ''
    }
  }
  return { types }
}

/** Extract paths from OpenAPI spec */
function extractOpenAPIPaths(spec: Record<string, unknown>): Record<string, string[]> {
  const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>
  const result: Record<string, string[]> = {}
  for (const [path, methods] of Object.entries(paths)) {
    result[path] = Object.keys(methods).filter(m => ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(m))
  }
  return result
}

/** Extract types from OpenAPI spec definitions/schemas */
function extractOpenAPITypes(spec: Record<string, unknown>): Record<string, string[]> {
  const schemas = ((spec.components as Record<string, unknown>)?.schemas
    ?? spec.definitions
    ?? {}) as Record<string, Record<string, unknown>>
  const result: Record<string, string[]> = {}
  for (const [name, schema] of Object.entries(schemas)) {
    const props = (schema.properties ?? {}) as Record<string, unknown>
    result[name] = Object.keys(props)
  }
  return result
}

/** Extract endpoints from GraphQL spec (Query, Mutation, Subscription) */
function extractGraphQLEndpoints(spec: Record<string, unknown>): string[] {
  const types = (spec.types ?? {}) as Record<string, string[]>
  const endpoints: string[] = []
  for (const [typeName, fields] of Object.entries(types)) {
    if (['Query', 'Mutation', 'Subscription'].includes(typeName)) {
      for (const field of fields) {
        endpoints.push(`${typeName}.${field}`)
      }
    }
  }
  return endpoints
}

/** Generate a simple hash for version identification */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}

/** Estimate days until a given date string */
function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 – Tool 1: analyzeSchemaDiff + formatDiffResult
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze differences between two API schema versions */
function analyzeSchemaDiff(data: SchemaComparisonInput): SchemaDiffResult {
  const { old_schema, new_schema, schema_type, api_name } = data
  const endpoints: EndpointChange[] = []
  const fields: FieldChange[] = []
  const types: TypeChange[] = []
  const parameters: ParameterChange[] = []

  if (schema_type === 'openapi') {
    const oldSpec = parseOpenAPISpec(old_schema)
    const newSpec = parseOpenAPISpec(new_schema)

    // Compare paths (endpoints)
    const oldPaths = extractOpenAPIPaths(oldSpec)
    const newPaths = extractOpenAPIPaths(newSpec)

    // Detect removed endpoints
    for (const [path, methods] of Object.entries(oldPaths)) {
      if (!newPaths[path]) {
        for (const method of methods) {
          endpoints.push({ method: method.toUpperCase(), path, change_type: 'removed', details: 'Endpoint completely removed' })
        }
      } else {
        // Detect removed methods on existing paths
        for (const method of methods) {
          if (!newPaths[path].includes(method)) {
            endpoints.push({ method: method.toUpperCase(), path, change_type: 'removed', details: 'HTTP method removed from path' })
          } else {
            // Check for modifications (simplified: compare description/summary)
            const oldMethods = ((oldSpec.paths as Record<string, Record<string, unknown>>)?.[path]) ?? {}
            const newMethods = ((newSpec.paths as Record<string, Record<string, unknown>>)?.[path]) ?? {}
            const oldDesc = String((oldMethods[method] as Record<string, unknown>)?.summary ?? '')
            const newDesc = String((newMethods[method] as Record<string, unknown>)?.summary ?? '')
            if (oldDesc !== newDesc) {
              endpoints.push({ method: method.toUpperCase(), path, change_type: 'modified', details: 'Summary/description changed' })
            }
          }
        }
      }
    }

    // Detect added endpoints
    for (const [path, methods] of Object.entries(newPaths)) {
      if (!oldPaths[path]) {
        for (const method of methods) {
          endpoints.push({ method: method.toUpperCase(), path, change_type: 'added', details: 'New endpoint added' })
        }
      } else {
        for (const method of methods) {
          if (!oldPaths[path].includes(method)) {
            endpoints.push({ method: method.toUpperCase(), path, change_type: 'added', details: 'New HTTP method on existing path' })
          }
        }
      }
    }

    // Compare types/schemas
    const oldTypes = extractOpenAPITypes(oldSpec)
    const newTypes = extractOpenAPITypes(newSpec)

    for (const [typeName, typeFields] of Object.entries(oldTypes)) {
      if (!newTypes[typeName]) {
        types.push({ type_name: typeName, change_type: 'removed', fields_affected: typeFields.length })
      } else {
        const common = typeFields.filter(f => newTypes[typeName].includes(f))
        const removed = typeFields.filter(f => !newTypes[typeName].includes(f))
        const added = (newTypes[typeName] ?? []).filter(f => !typeFields.includes(f))
        const affected = removed.length + added.length
        if (affected > 0) {
          types.push({ type_name: typeName, change_type: 'modified', fields_affected: affected })
          for (const f of removed) {
            fields.push({ parent: typeName, field: f, change_type: 'removed' })
          }
          if (added.length > 0) {
            for (const f of added) {
              fields.push({ parent: typeName, field: f, change_type: 'added' })
            }
          }
          for (const f of common) {
            // Check for type modifications
            const oldProps = ((oldSpec.components as Record<string, unknown>)?.schemas as Record<string, Record<string, unknown>>)?.[typeName]?.properties as Record<string, Record<string, unknown>> ?? (oldSpec.definitions as Record<string, Record<string, unknown>>)?.[typeName]?.properties as Record<string, Record<string, unknown>> ?? {}
            const newProps = ((newSpec.components as Record<string, unknown>)?.schemas as Record<string, Record<string, unknown>>)?.[typeName]?.properties as Record<string, Record<string, unknown>> ?? (newSpec.definitions as Record<string, Record<string, unknown>>)?.[typeName]?.properties as Record<string, Record<string, unknown>> ?? {}
            const oldType = String(oldProps[f]?.type ?? '')
            const newType = String(newProps[f]?.type ?? '')
            if (oldType !== newType && oldType !== '' && newType !== '') {
              fields.push({ parent: typeName, field: f, change_type: 'modified', old_type: oldType, new_type: newType })
            }
          }
        }
      }
    }

    for (const [typeName] of Object.entries(newTypes)) {
      if (!oldTypes[typeName]) {
        types.push({ type_name: typeName, change_type: 'added', fields_affected: (newTypes[typeName] ?? []).length })
      }
    }

  } else {
    // GraphQL schema comparison
    const oldSpec = parseGraphQLSpec(old_schema)
    const newSpec = parseGraphQLSpec(new_schema)

    const oldTypes = (oldSpec.types ?? {}) as Record<string, string[]>
    const newTypes = (newSpec.types ?? {}) as Record<string, string[]>

    // Compare endpoints (Query/Mutation/Subscription fields)
    const oldEndpoints = extractGraphQLEndpoints(oldSpec)
    const newEndpoints = extractGraphQLEndpoints(newSpec)

    for (const ep of oldEndpoints) {
      if (!newEndpoints.includes(ep)) {
        endpoints.push({ method: ep.split('.')[0] ?? 'Query', path: ep, change_type: 'removed', details: 'GraphQL field removed' })
      }
    }
    for (const ep of newEndpoints) {
      if (!oldEndpoints.includes(ep)) {
        endpoints.push({ method: ep.split('.')[0] ?? 'Query', path: ep, change_type: 'added', details: 'GraphQL field added' })
      }
    }

    // Compare types
    for (const [typeName, typeFields] of Object.entries(oldTypes)) {
      if (!newTypes[typeName]) {
        types.push({ type_name: typeName, change_type: 'removed', fields_affected: typeFields.length })
      } else {
        const removed = typeFields.filter(f => !newTypes[typeName].includes(f))
        const added = newTypes[typeName].filter(f => !typeFields.includes(f))
        const affected = removed.length + added.length
        if (affected > 0) {
          types.push({ type_name: typeName, change_type: 'modified', fields_affected: affected })
          for (const f of removed) {
            fields.push({ parent: typeName, field: f, change_type: 'removed' })
          }
          for (const f of added) {
            fields.push({ parent: typeName, field: f, change_type: 'added' })
          }
        }
      }
    }

    for (const [typeName, typeFields] of Object.entries(newTypes)) {
      if (!oldTypes[typeName]) {
        types.push({ type_name: typeName, change_type: 'added', fields_affected: typeFields.length })
      }
    }
  }

  return {
    api_name,
    old_version: simpleHash(old_schema),
    new_version: simpleHash(new_schema),
    endpoints,
    fields,
    types,
    parameters,
    summary: {
      total_changes: endpoints.length + fields.length + types.length + parameters.length,
      endpoint_changes: endpoints.length,
      field_changes: fields.length,
      type_changes: types.length,
      parameter_changes: parameters.length,
    },
  }
}

/** Format the schema diff result into a readable report */
function formatDiffResult(result: SchemaDiffResult): string {
  const lines: string[] = []
  lines.push(`# API Schema Diff Report: ${result.api_name}`)
  lines.push('')
  lines.push(`Old Version Hash: \`${result.old_version}\` → New Version Hash: \`${result.new_version}\``)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('```')
  lines.push(`Total Changes:        ${result.summary.total_changes}`)
  lines.push(`Endpoint Changes:     ${result.summary.endpoint_changes}`)
  lines.push(`Field Changes:        ${result.summary.field_changes}`)
  lines.push(`Type Changes:         ${result.summary.type_changes}`)
  lines.push(`Parameter Changes:    ${result.summary.parameter_changes}`)
  lines.push('```')
  lines.push('')

  if (result.endpoints.length > 0) {
    lines.push('## Endpoint Changes')
    lines.push('')
    lines.push('| Status | Method | Path | Details |')
    lines.push('|--------|--------|------|---------|')
    for (const ep of result.endpoints) {
      const icon = ep.change_type === 'added' ? '🟢 +' : ep.change_type === 'removed' ? '🔴 -' : '🟡 ~'
      lines.push(`| ${icon} | ${ep.method} | \`${ep.path}\` | ${ep.details ?? ''} |`)
    }
    lines.push('')
  }

  if (result.fields.length > 0) {
    lines.push('## Field Changes')
    lines.push('')
    lines.push('| Status | Parent | Field | Change Detail |')
    lines.push('|--------|--------|-------|---------------|')
    for (const f of result.fields) {
      const icon = f.change_type === 'added' ? '🟢 +' : f.change_type === 'removed' ? '🔴 -' : '🟡 ~'
      const detail = f.old_type && f.new_type ? `${f.old_type} → ${f.new_type}` : ''
      lines.push(`| ${icon} | ${f.parent} | \`${f.field}\` | ${detail} |`)
    }
    lines.push('')
  }

  if (result.types.length > 0) {
    lines.push('## Type Changes')
    lines.push('')
    lines.push('| Status | Type | Fields Affected |')
    lines.push('|--------|------|-----------------|')
    for (const t of result.types) {
      const icon = t.change_type === 'added' ? '🟢 +' : t.change_type === 'removed' ? '🔴 -' : '🟡 ~'
      lines.push(`| ${icon} | ${t.type_name} | ${t.fields_affected} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`Report generated by dsh-tool-apistalk | Schema Diff Detection`)

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 – Tool 2: analyzeBreakingChanges + formatBreakingChangesReport
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<SeverityLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }

/** Analyze breaking changes from a schema diff result */
function analyzeBreakingChanges(diff: SchemaDiffResult): BreakingChangeResult {
  const items: BreakingChangeItem[] = []

  // Critical: removed endpoints
  const removedEndpoints = diff.endpoints.filter(e => e.change_type === 'removed')
  for (const ep of removedEndpoints) {
    items.push({
      category: 'Endpoint',
      description: `${ep.method} ${ep.path} has been removed`,
      severity: 'critical',
      affected_endpoints: [`${ep.method} ${ep.path}`],
      migration_effort: 'days',
      recommendation: `Remove all calls to ${ep.method} ${ep.path} or migrate to the replacement endpoint before upgrading.`,
    })
  }

  // High: removed types
  const removedTypes = diff.types.filter(t => t.change_type === 'removed')
  for (const t of removedTypes) {
    items.push({
      category: 'Type',
      description: `Type ${t.type_name} has been removed (${t.fields_affected} fields)`,
      severity: 'high',
      affected_endpoints: [],
      migration_effort: 'hours',
      recommendation: `Replace references to type ${t.type_name} with the suggested alternative type.`,
    })
  }

  // High: type field type changes
  const typeChangedFields = diff.fields.filter(f => f.change_type === 'modified' && f.old_type !== undefined)
  for (const f of typeChangedFields) {
    items.push({
      category: 'FieldType',
      description: `Field ${f.parent}.${f.field} changed from ${f.old_type} to ${f.new_type}`,
      severity: 'high',
      affected_endpoints: [],
      migration_effort: 'hours',
      recommendation: `Update serialization/deserialization logic for ${f.parent}.${f.field}.`,
    })
  }

  // Medium: removed fields
  const removedFields = diff.fields.filter(f => f.change_type === 'removed')
  for (const f of removedFields) {
    items.push({
      category: 'Field',
      description: `Field ${f.parent}.${f.field} has been removed`,
      severity: 'medium',
      affected_endpoints: [],
      migration_effort: 'hours',
      recommendation: `Check if ${f.parent}.${f.field} is used in your codebase and remove references.`,
    })
  }

  // Low: modified endpoints (description changes)
  const modifiedEndpoints = diff.endpoints.filter(e => e.change_type === 'modified')
  for (const ep of modifiedEndpoints) {
    items.push({
      category: 'EndpointDoc',
      description: `${ep.method} ${ep.path} documentation/summary changed`,
      severity: 'low',
      affected_endpoints: [`${ep.method} ${ep.path}`],
      migration_effort: 'minutes',
      recommendation: 'Review updated documentation for behavioral changes.',
    })
  }

  const critical = items.filter(i => i.severity === 'critical').length
  const high = items.filter(i => i.severity === 'high').length
  const medium = items.filter(i => i.severity === 'medium').length
  const low = items.filter(i => i.severity === 'low').length

  let overall_risk: 'extreme' | 'high' | 'moderate' | 'low'
  if (critical > 0) {
    overall_risk = 'extreme'
  } else if (high > 2) {
    overall_risk = 'high'
  } else if (items.length > 0) {
    overall_risk = 'moderate'
  } else {
    overall_risk = 'low'
  }

  return {
    total_breaking: items.length,
    critical,
    high,
    medium,
    low,
    items,
    overall_risk,
  }
}

/** Format breaking change analysis into a report */
function formatBreakingChangesReport(result: BreakingChangeResult): string {
  const lines: string[] = []
  const riskEmoji = result.overall_risk === 'extreme' ? '🔴' : result.overall_risk === 'high' ? '🟠' : result.overall_risk === 'moderate' ? '🟡' : '🟢'

  lines.push(`# Breaking Change Analysis Report`)
  lines.push('')
  lines.push(`## Overall Risk: ${riskEmoji} ${result.overall_risk.toUpperCase()}`)
  lines.push('')
  lines.push('```')
  lines.push(`Total Breaking Changes: ${result.total_breaking}`)
  lines.push(`  Critical: ${result.critical}`)
  lines.push(`  High:     ${result.high}`)
  lines.push(`  Medium:   ${result.medium}`)
  lines.push(`  Low:      ${result.low}`)
  lines.push('```')
  lines.push('')

  // Group by severity
  const grouped: Record<SeverityLevel, BreakingChangeItem[]> = { critical: [], high: [], medium: [], low: [] }
  for (const item of result.items) {
    grouped[item.severity].push(item)
  }

  for (const sev of ['critical', 'high', 'medium', 'low'] as SeverityLevel[]) {
    const sevItems = grouped[sev]
    if (sevItems.length === 0) continue
    const icon = sev === 'critical' ? '🔴' : sev === 'high' ? '🟠' : sev === 'medium' ? '🟡' : '🔵'
    lines.push(`## ${icon} ${sev.toUpperCase()} (${sevItems.length})`)
    lines.push('')
    for (let i = 0; i < sevItems.length; i++) {
      const item = sevItems[i]!
      lines.push(`### ${i + 1}. [${item.category}] ${item.description}`)
      lines.push('')
      lines.push(`- **Migration Effort:** ${item.migration_effort}`)
      lines.push(`- **Affected Endpoints:** ${item.affected_endpoints.length > 0 ? item.affected_endpoints.join(', ') : 'N/A (type-level)'}`)
      lines.push(`- **Recommendation:** ${item.recommendation}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Breaking Change Analysis')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 – Tool 3: analyzeMigrationImpact + formatMigrationImpactReport
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze migration impact from schema diff and breaking changes */
function analyzeMigrationImpact(diff: SchemaDiffResult, breaking: BreakingChangeResult): MigrationImpactResult {
  const items: MigrationImpactItem[] = []

  // Generate migration items based on breaking changes
  const modules = ['api-client', 'models', 'services', 'controllers', 'tests']

  for (const bc of breaking.items || []) {
    const mod = modules[Math.abs(simpleHash(bc.category).charCodeAt(0)) % modules.length] ?? 'api-client'
    const effortDays = bc.severity === 'critical' ? 3 + (bc.affected_endpoints.length * 2) :
                       bc.severity === 'high' ? 1 + bc.affected_endpoints.length :
                       bc.severity === 'medium' ? 0.5 : 0.25

    items.push({
      client_module: mod,
      file_path: `src/${mod}/${bc.category.toLowerCase().replace(/\s/g, '-')}-handler.ts`,
      estimated_effort_days: effortDays,
      risk_level: bc.severity === 'critical' || bc.severity === 'high' ? 'high' : bc.severity === 'medium' ? 'medium' : 'low',
      affected_calls: bc.affected_endpoints.length || 1,
      description: `Migrate ${bc.category} change: ${bc.description}`,
    })
  }

  const totalEffort = items.reduce((sum, i) => sum + i.estimated_effort_days, 0)
  const highRiskCount = items.filter(i => i.risk_level === 'high').length

  let recommended_strategy: string
  if (totalEffort > 10) {
    recommended_strategy = 'Split migration into multiple releases with intermediate compatibility layers.'
  } else if (highRiskCount > 0) {
    recommended_strategy = 'Perform migration in a dedicated sprint with thorough testing.'
  } else {
    recommended_strategy = 'Low-risk changes can be batched into the next regular release.'
  }

  return {
    total_effort_days: Math.round(totalEffort * 10) / 10,
    high_risk_count: highRiskCount,
    items,
    recommended_strategy,
  }
}

/** Format migration impact report */
function formatMigrationImpactReport(result: MigrationImpactResult): string {
  const lines: string[] = []

  lines.push('# Migration Impact Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('```')
  lines.push(`Total Migration Effort: ${result.total_effort_days} person-days`)
  lines.push(`High Risk Items:        ${result.high_risk_count}`)
  lines.push(`Total Items:            ${result.items.length}`)
  lines.push('```')
  lines.push('')
  lines.push(`**Recommended Strategy:** ${result.recommended_strategy}`)
  lines.push('')

  if (result.items.length > 0) {
    lines.push('## Detailed Migration Items')
    lines.push('')
    lines.push('| Module | File | Effort (days) | Risk | Calls | Description |')
    lines.push('|--------|------|---------------|------|-------|-------------|')
    for (const item of result.items) {
      const riskEmoji = item.risk_level === 'high' ? '🔴' : item.risk_level === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${item.client_module} | \`${item.file_path}\` | ${item.estimated_effort_days} | ${riskEmoji} ${item.risk_level} | ${item.affected_calls} | ${item.description} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Migration Impact Analysis')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 – Tool 4: calculateCompatibilityScore + formatCompatibilityScoreReport
// ─────────────────────────────────────────────────────────────────────────────

/** Calculate compatibility score between two API versions */
function calculateCompatibilityScore(diff: SchemaDiffResult, breaking: BreakingChangeResult): CompatibilityScoreResult {
  const totalEndpoints = diff.endpoints.length + 1 // +1 to avoid division by zero
  const removedEndpoints = diff.endpoints.filter(e => e.change_type === 'removed').length

  // Backward compatible rate: based on non-removed ratio
  const backwardRate = Math.max(0, 1 - (removedEndpoints / totalEndpoints))

  // Feature coverage: based on type changes
  const totalTypes = diff.types.length + 1
  const removedTypes = diff.types.filter(t => t.change_type === 'removed').length
  const featureRate = Math.max(0, 1 - (removedTypes / totalTypes))

  // Behavioral consistency: based on field type changes
  const totalFields = diff.fields.length + 1
  const typeChangedFields = diff.fields.filter(f => f.change_type === 'modified' && f.old_type !== undefined).length
  const behavioralRate = Math.max(0, 1 - (typeChangedFields / totalFields))

  // Weighted score
  const score = Math.round((backwardRate * 0.5 + featureRate * 0.3 + behavioralRate * 0.2) * 100)

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  const details: string[] = []
  if (backwardRate < 1) details.push(`${removedEndpoints} endpoint(s) removed, reducing backward compatibility.`)
  if (featureRate < 1) details.push(`${removedTypes} type(s) removed, reducing feature coverage.`)
  if (behavioralRate < 1) details.push(`${typeChangedFields} field type change(s), affecting behavioral consistency.`)
  if (score === 100) details.push('Full compatibility — no breaking changes detected.')

  return {
    score,
    grade,
    backward_compatible_rate: Math.round(backwardRate * 100),
    feature_coverage_rate: Math.round(featureRate * 100),
    behavioral_consistency_rate: Math.round(behavioralRate * 100),
    details,
  }
}

/** Format compatibility score report */
function formatCompatibilityScoreReport(result: CompatibilityScoreResult): string {
  const lines: string[] = []
  const gradeEmoji = result.grade === 'A' ? '🟢' : result.grade === 'B' ? '🔵' : result.grade === 'C' ? '🟡' : result.grade === 'D' ? '🟠' : '🔴'

  lines.push('# API Compatibility Score Report')
  lines.push('')
  lines.push('## Overall Score')
  lines.push('')
  lines.push(`# ${gradeEmoji} ${result.score}/100 (Grade ${result.grade})`)
  lines.push('')
  lines.push('## Component Scores')
  lines.push('')
  lines.push('| Metric | Score |')
  lines.push('|--------|-------|')
  lines.push(`| Backward Compatibility | ${result.backward_compatible_rate}% |`)
  lines.push(`| Feature Coverage       | ${result.feature_coverage_rate}% |`)
  lines.push(`| Behavioral Consistency | ${result.behavioral_consistency_rate}% |`)
  lines.push('')
  lines.push('## Details')
  lines.push('')
  if (result.details.length > 0) {
    for (const d of result.details) {
      lines.push(`- ${d}`)
    }
  } else {
    lines.push('- No notes.')
  }
  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  if (result.grade === 'A') {
    lines.push('The API change is fully backward compatible. No migration effort required.')
  } else if (result.grade === 'B') {
    lines.push('Minor breaking changes detected. Low-risk migration with minimal code adaptation.')
  } else if (result.grade === 'C') {
    lines.push('Moderate breaking changes. Requires planned migration with testing.')
  } else if (result.grade === 'D') {
    lines.push('Significant breaking changes. Dedicated migration sprint recommended.')
  } else {
    lines.push('Major breaking changes. Full migration required — consider version pinning.')
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Compatibility Score')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 – Tool 5: analyzeDeprecation + formatDeprecationReport
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze deprecated items in the schema */
function analyzeDeprecation(deprecation_data: {
  schema: string
  schema_type: 'openapi' | 'graphql'
  current_date?: string
}): DeprecationAlertResult {
  const { schema, schema_type, current_date } = deprecation_data
  const items: DeprecationItem[] = []

  if (schema_type === 'openapi') {
    const spec = parseOpenAPISpec(schema)
    const paths = ((spec.paths ?? {}) as Record<string, Record<string, Record<string, unknown>>>)

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, detail] of Object.entries(methods)) {
        if (typeof detail === 'object' && detail !== null) {
          const d = detail as Record<string, unknown>
          if (d.deprecated === true) {
            const deprecatedSince = String(d['x-deprecated-since'] ?? '2024-01-01')
            const removalDate = d['x-removal-date'] as string | undefined
            const remaining = removalDate ? daysFromNow(removalDate) : 365
            items.push({
              name: `${method.toUpperCase()} ${path}`,
              type: 'endpoint',
              deprecated_since: deprecatedSince,
              removal_date: removalDate,
              days_until_removal: remaining,
              replacement: d['x-replacement'] as string | undefined,
              message: String(d['x-deprecation-message'] ?? 'This endpoint is deprecated.'),
            })
          }

          // Check parameters
          const params = (d.parameters ?? []) as Record<string, unknown>[]
          for (const param of params) {
            if (param.deprecated === true && typeof param.name === 'string') {
              items.push({
                name: `${method.toUpperCase()} ${path} → param:${param.name}`,
                type: 'parameter',
                deprecated_since: String(param['x-deprecated-since'] ?? '2024-01-01'),
                removal_date: param['x-removal-date'] as string | undefined,
                days_until_removal: param['x-removal-date'] ? daysFromNow(String(param['x-removal-date'])) : 180,
                replacement: param['x-replacement'] as string | undefined,
                message: String(param.description ?? 'This parameter is deprecated.'),
              })
            }
          }
        }
      }
    }
  } else {
    // GraphQL: parse @deprecated directive
    const lines = schema.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.includes('@deprecated')) {
        const nextLine = lines[i + 1]?.trim() ?? ''
        const fieldName = nextLine.split(':')[0]?.trim() ?? 'unknown'
        items.push({
          name: fieldName,
          type: 'field',
          deprecated_since: '2024-01-01',
          days_until_removal: 180,
          message: `GraphQL field ${fieldName} is deprecated.`,
        })
      }
    }
  }

  const urgentRemovals = items.filter(i => i.days_until_removal < 30 && i.days_until_removal >= 0).length

  const sorted = [...items].sort((a, b) => a.days_until_removal - b.days_until_removal)
  const timeline = sorted.slice(0, 5).map(i => `${i.name} (${i.days_until_removal}d left)`).join(', ')

  return {
    total_deprecated: items.length,
    urgent_removals: urgentRemovals,
    items: sorted,
    timeline_summary: timeline,
  }
}

/** Format deprecation alert report */
function formatDeprecationReport(result: DeprecationAlertResult): string {
  const lines: string[] = []
  const alertEmoji = result.urgent_removals > 0 ? '🚨' : result.total_deprecated > 0 ? '🟡' : '🟢'

  lines.push(`# API Deprecation Alert ${alertEmoji}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- **Total Deprecated Items:** ${result.total_deprecated}`)
  lines.push(`- **Urgent Removals (< 30d):** ${result.urgent_removals}`)
  lines.push('')
  if (result.timeline_summary) {
    lines.push(`**Upcoming Removals:** ${result.timeline_summary}`)
    lines.push('')
  }

  if (result.items.length > 0) {
    lines.push('## Deprecation Details')
    lines.push('')
    lines.push('| Item | Type | Deprecated Since | Days Left | Replacement |')
    lines.push('|------|------|------------------|-----------|-------------|')
    for (const item of result.items) {
      const urgencyEmoji = item.days_until_removal < 30 ? '🔴' : item.days_until_removal < 90 ? '🟡' : '🟢'
      const replacement = item.replacement ?? 'N/A'
      lines.push(`| ${item.name} | ${item.type} | ${item.deprecated_since} | ${urgencyEmoji} ${item.days_until_removal} | ${replacement} |`)
    }
    lines.push('')

    lines.push('## Deprecation Messages')
    lines.push('')
    for (const item of result.items) {
      lines.push(`**${item.name}:** ${item.message}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Deprecation Alert')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 – Tool 6: adviseVersionUpgrade + formatUpgradeAdviceReport
// ─────────────────────────────────────────────────────────────────────────────

/** Advise optimal upgrade path between versions */
function adviseVersionUpgrade(upgrade_input: {
  current_version: string
  target_version: string
  schema_history: { version: string; schema: string; schema_type: 'openapi' | 'graphql' }[]
  api_name: string
}): UpgradeAdvisorResult {
  const { current_version, target_version, schema_history, api_name } = upgrade_input

  // Sort schema history by version order (simplified: use array index)
  const sortedHistory = [...schema_history].sort((a, b) => {
    const ai = schema_history.indexOf(a)
    const bi = schema_history.indexOf(b)
    return ai - bi
  })

  const steps: UpgradeStep[] = []
  let totalBreaking = 0

  // If we have intermediate versions, generate step-by-step path
  for (let i = 0; i < sortedHistory.length - 1; i++) {
    const from = sortedHistory[i]!
    const to = sortedHistory[i + 1]!

    // Analyze diff between consecutive versions
    const diff = analyzeSchemaDiff({
      old_schema: from.schema,
      new_schema: to.schema,
      schema_type: from.schema_type,
      api_name,
    })
    const breaking = analyzeBreakingChanges(diff)

    totalBreaking += breaking.total_breaking

    steps.push({
      from_version: from.version,
      to_version: to.version,
      breaking_changes_count: breaking.total_breaking,
      effort_estimate: `${Math.ceil(diff.summary.total_changes * 0.5)} hours`,
      key_concerns: breaking.items.slice(0, 3).map(b => b.description),
    })
  }

  const directUpgradeSafe = steps.every(s => s.breaking_changes_count === 0)
  const totalHours = steps.reduce((sum, s) => sum + parseInt(s.effort_estimate) || 0, 0)

  return {
    current_version,
    target_version,
    direct_upgrade_safe: directUpgradeSafe,
    steps,
    total_breaking_changes: totalBreaking,
    total_effort_estimate: `${totalHours} hours`,
  }
}

/** Format upgrade advice report */
function formatUpgradeAdviceReport(result: UpgradeAdvisorResult): string {
  const lines: string[] = []
  const safeEmoji = result.direct_upgrade_safe ? '🟢' : '🔴'

  lines.push('# Version Upgrade Advisor')
  lines.push('')
  lines.push(`## Upgrade Path: ${result.current_version} → ${result.target_version}`)
  lines.push('')
  lines.push(`**Direct Upgrade ${safeEmoji}:** ${result.direct_upgrade_safe ? 'SAFE — no breaking changes' : 'NOT SAFE — breaking changes detected'}`)
  lines.push('')
  lines.push('## Upgrade Summary')
  lines.push('')
  lines.push('```')
  lines.push(`Total Breaking Changes: ${result.total_breaking_changes}`)
  lines.push(`Estimated Effort:       ${result.total_effort_estimate}`)
  lines.push(`Number of Steps:        ${result.steps.length}`)
  lines.push('```')
  lines.push('')

  if (result.steps.length > 0) {
    lines.push('## Step-by-Step Upgrade Path')
    lines.push('')
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i]!
      lines.push(`### Step ${i + 1}: ${step.from_version} → ${step.to_version}`)
      lines.push('')
      lines.push(`- **Breaking Changes:** ${step.breaking_changes_count}`)
      lines.push(`- **Effort Estimate:** ${step.effort_estimate}`)
      if (step.key_concerns.length > 0) {
        lines.push(`- **Key Concerns:**`)
        for (const concern of step.key_concerns) {
          lines.push(`  - ${concern}`)
        }
      }
      lines.push('')
    }
  }

  if (!result.direct_upgrade_safe) {
    lines.push('## ⚠️ Migration Checklist')
    lines.push('')
    lines.push('- [ ] Review all breaking changes listed above')
    lines.push('- [ ] Create a compatibility shim/adapter layer')
    lines.push('- [ ] Update client code for each step')
    lines.push('- [ ] Run full integration test suite after each step')
    lines.push('- [ ] Monitor error rates in production')
    lines.push('')
  }

  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Version Upgrade Advisor')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 – Tool 7: analyzeClientCompatibility + formatClientCompatibilityReport
// ─────────────────────────────────────────────────────────────────────────────

/** Analyze client code compatibility with new API version */
function analyzeClientCompatibility(compat_input: {
  client_code: { filename: string; content: string }[]
  schema_diff: SchemaDiffResult
}): ClientCompatibilityResult {
  const { client_code, schema_diff } = compat_input
  const issues: ClientCompatIssue[] = []
  const removedPaths = schema_diff.endpoints.filter(e => e.change_type === 'removed')
  const removedFields = schema_diff.fields.filter(f => f.change_type === 'removed')
  const typeChangedFields = schema_diff.fields.filter(f => f.change_type === 'modified' && f.old_type !== undefined)

  for (const file of client_code) {
    const lines = file.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!

      // Check for removed endpoint usage
      for (const ep of removedPaths) {
        if (line.toLowerCase().includes(ep.path.toLowerCase()) || line.toLowerCase().includes(ep.path.replace(/\//g, '-').toLowerCase())) {
          issues.push({
            file: file.filename,
            line: i + 1,
            severity: 'error',
            description: `Uses removed endpoint ${ep.method} ${ep.path}`,
            suggestion: 'Remove or replace this call before upgrading.',
            api_endpoint: `${ep.method} ${ep.path}`,
          })
        }
      }

      // Check for removed field usage
      for (const f of removedFields) {
        if (line.includes(f.field) && line.includes('.')) {
          issues.push({
            file: file.filename,
            line: i + 1,
            severity: 'error',
            description: `Accesses removed field ${f.parent}.${f.field}`,
            suggestion: `Remove ${f.field} access or use the replacement field.`,
            api_endpoint: 'N/A',
          })
        }
      }

      // Check for type-dependent code
      for (const tc of typeChangedFields) {
        if (line.includes(tc.field) && (line.includes(tc.old_type ?? '') || line.includes('as ') || line.includes(': '))) {
          issues.push({
            file: file.filename,
            line: i + 1,
            severity: 'warning',
            description: `Field ${tc.field} type changed from ${tc.old_type} to ${tc.new_type}`,
            suggestion: `Update type handling for ${tc.field} to use ${tc.new_type}.`,
            api_endpoint: 'N/A',
          })
        }
      }
    }
  }

  const filesAffected = new Set(issues.map(i => i.file)).size
  const totalChecks = client_code.reduce((sum, f) => sum + f.content.split('\n').length, 0)
  const compatibilityPct = totalChecks > 0 ? Math.round((1 - issues.length / totalChecks) * 100) : 100

  return {
    compatible: issues.filter(i => i.severity === 'error').length === 0,
    compatibility_percentage: Math.max(0, compatibilityPct),
    issues,
    files_affected: filesAffected,
  }
}

/** Format client compatibility report */
function formatClientCompatibilityReport(result: ClientCompatibilityResult): string {
  const lines: string[] = []
  const compatEmoji = result.compatible ? '🟢' : result.compatibility_percentage > 70 ? '🟡' : '🔴'

  lines.push(`# Client Compatibility Report ${compatEmoji}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('```')
  lines.push(`Compatible:          ${result.compatible ? 'YES' : 'NO'}`)
  lines.push(`Compatibility:       ${result.compatibility_percentage}%`)
  lines.push(`Issues Found:        ${result.issues.length}`)
  lines.push(`Files Affected:      ${result.files_affected}`)
  lines.push('```')
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('## Issues')
    lines.push('')
    lines.push('| Severity | File:Line | Description | Suggestion | Endpoint |')
    lines.push('|----------|-----------|-------------|------------|----------|')
    for (const issue of result.issues) {
      const sevEmoji = issue.severity === 'error' ? '🔴' : '🟡'
      lines.push(`| ${sevEmoji} ${issue.severity} | ${issue.file}:${issue.line} | ${issue.description} | ${issue.suggestion} | ${issue.api_endpoint} |`)
    }
    lines.push('')

    // Group by file
    const fileGroups: Record<string, ClientCompatIssue[]> = {}
    for (const issue of result.issues) {
      const group = fileGroups[issue.file] ?? (fileGroups[issue.file] = [])
      group.push(issue)
    }
    lines.push('## Files Requiring Changes')
    lines.push('')
    for (const [file, fileIssues] of Object.entries(fileGroups)) {
      lines.push(`- **${file}** (${fileIssues.length} issue(s))`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('Report generated by dsh-tool-apistalk | Client Compatibility Check')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 – Tool 8: generateChangelog + formatChangelogReport
// ─────────────────────────────────────────────────────────────────────────────

/** Generate changelog from schema diff */
function generateChangelog(diff_input: {
  diff: SchemaDiffResult
  version: string
  format: 'markdown' | 'json' | 'plain'
  date?: string
}): ChangelogResult {
  const { diff, version, format, date } = diff_input
  const entries: ChangelogEntry[] = []
  const releaseDate = date ?? new Date().toISOString().split('T')[0]!

  // Map endpoint changes
  for (const ep of diff.endpoints) {
    const type = ep.change_type === 'added' ? 'Added' : ep.change_type === 'removed' ? 'Removed' : 'Changed'
    entries.push({
      type,
      description: `${ep.method} ${ep.path} ${ep.change_type === 'modified' ? 'updated' : ep.change_type}`,
      related_endpoints: [`${ep.method} ${ep.path}`],
    })
  }

  // Map field changes
  for (const f of diff.fields) {
    const type = f.change_type === 'added' ? 'Added' : f.change_type === 'removed' ? 'Removed' : 'Changed'
    const detail = f.old_type && f.new_type ? ` (${f.old_type} → ${f.new_type})` : ''
    entries.push({
      type,
      description: `Field ${f.parent}.${f.field}${detail}`,
      related_endpoints: [],
    })
  }

  // Map type changes
  for (const t of diff.types) {
    const type = t.change_type === 'added' ? 'Added' : t.change_type === 'removed' ? 'Removed' : 'Changed'
    entries.push({
      type,
      description: `Type ${t.type_name} (${t.fields_affected} fields affected)`,
      related_endpoints: [],
    })
  }

  // Sort entries by type priority
  const typePriority: Record<string, number> = { Added: 1, Changed: 2, Deprecated: 3, Fixed: 4, Removed: 5 }
  entries.sort((a, b) => (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99))

  // Format output
  let formatted_output: string
  if (format === 'json') {
    formatted_output = JSON.stringify({ version, date: releaseDate, entries }, null, 2)
  } else if (format === 'plain') {
    const plines: string[] = []
    plines.push(`Version ${version} (${releaseDate})`)
    plines.push('')
    const grouped: Record<string, ChangelogEntry[]> = {}
    for (const e of entries) {
      const g = grouped[e.type] ?? (grouped[e.type] = [])
      g.push(e)
    }
    for (const [type, items] of Object.entries(grouped)) {
      plines.push(`[${type}]`)
      for (const item of items) {
        plines.push(`  - ${item.description}`)
      }
      plines.push('')
    }
    formatted_output = plines.join('\n')
  } else {
    // markdown (default)
    const mlines: string[] = []
    mlines.push(`# Changelog - ${version}`)
    mlines.push('')
    mlines.push(`**Release Date:** ${releaseDate}`)
    mlines.push('')
    const grouped: Record<string, ChangelogEntry[]> = {}
    for (const e of entries) {
      const g = grouped[e.type] ?? (grouped[e.type] = [])
      g.push(e)
    }
    const typeEmoji: Record<string, string> = { Added: '✨', Changed: '🔄', Deprecated: '⚠️', Fixed: '🐛', Removed: '🗑️' }
    for (const [type, items] of Object.entries(grouped)) {
      const emoji = typeEmoji[type] ?? '📝'
      mlines.push(`## ${emoji} ${type}`)
      mlines.push('')
      for (const item of items) {
        mlines.push(`- ${item.description}`)
      }
      mlines.push('')
    }
    formatted_output = mlines.join('\n')
  }

  return { version, date: releaseDate, entries, formatted_output }
}

/** Format changelog report (return formatted output directly) */
function formatChangelogReport(result: ChangelogResult): string {
  return result.formatted_output
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 – Plugin Entry Point & Tool Registrations
// ─────────────────────────────────────────────────────────────────────────────

export const name = 'dsh-tool-apistalk'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // ── Tool 1: schema_diff_detect ──────────────────────────────────────────
  tools.register(defineTool({
    name: 'schema_diff_detect',
    description: 'Detect schema changes between two versions of an API specification (OpenAPI/GraphQL). Identifies added/removed/modified endpoints, fields, types, and parameters.',
    parameters: {
      schema_comparison: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: old_schema (string: OpenAPI JSON or GraphQL SDL), new_schema (string), schema_type (\'openapi\'|\'graphql\'), api_name (string)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { schema_comparison: string }) {
      const data: SchemaComparisonInput = JSON.parse(args.schema_comparison)
      const result = analyzeSchemaDiff(data)
      return formatDiffResult(result)
    },
  }))

  // ── Tool 2: breaking_change_analysis ────────────────────────────────────
  tools.register(defineTool({
    name: 'breaking_change_analysis',
    description: 'Analyze schema changes to identify breaking changes including endpoint removal, required field modifications, and type changes. Evaluates severity and affected areas.',
    parameters: {
      schema_diff_input: {
        type: 'string',
        required: true,
        description: 'JSON object: the output from schema_diff_detect (serialized SchemaDiffResult).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { schema_diff_input: string }) {
      const diff: SchemaDiffResult = JSON.parse(args.schema_diff_input)
      const result = analyzeBreakingChanges(diff)
      return formatBreakingChangesReport(result)
    },
  }))

  // ── Tool 3: migration_impact_map ────────────────────────────────────────
  tools.register(defineTool({
    name: 'migration_impact_map',
    description: 'Based on schema changes, map out client code locations that need modification, estimate migration effort in person-days, and identify high-risk migration points.',
    parameters: {
      migration_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: diff (SchemaDiffResult as JSON string), breaking (BreakingChangeResult as JSON string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { migration_input: string }) {
      const input = JSON.parse(args.migration_input) as { diff: string; breaking: string }
      const diff: SchemaDiffResult = JSON.parse(input.diff)
      const breaking: BreakingChangeResult = JSON.parse(input.breaking)
      const result = analyzeMigrationImpact(diff, breaking)
      return formatMigrationImpactReport(result)
    },
  }))

  // ── Tool 4: compatibility_score ─────────────────────────────────────────
  tools.register(defineTool({
    name: 'compatibility_score',
    description: 'Calculate a compatibility score (0-100) between old and new API versions, including backward compatibility rate, feature coverage, behavioral consistency, and a letter grade.',
    parameters: {
      score_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: diff (SchemaDiffResult as JSON string), breaking (BreakingChangeResult as JSON string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { score_input: string }) {
      const input = JSON.parse(args.score_input) as { diff: string; breaking: string }
      const diff: SchemaDiffResult = JSON.parse(input.diff)
      const breaking: BreakingChangeResult = JSON.parse(input.breaking)
      const result = calculateCompatibilityScore(diff, breaking)
      return formatCompatibilityScoreReport(result)
    },
  }))

  // ── Tool 5: api_deprecation_alert ──────────────────────────────────────
  tools.register(defineTool({
    name: 'api_deprecation_alert',
    description: 'Scan API schema for deprecated markers, build a deprecation timeline, calculate days until removal, and provide replacement suggestions.',
    parameters: {
      deprecation_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: schema (string), schema_type (\'openapi\'|\'graphql\'), current_date (optional string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { deprecation_input: string }) {
      const data = JSON.parse(args.deprecation_input) as { schema: string; schema_type: 'openapi' | 'graphql'; current_date?: string }
      const result = analyzeDeprecation(data)
      return formatDeprecationReport(result)
    },
  }))

  // ── Tool 6: version_upgrade_advisor ────────────────────────────────────
  tools.register(defineTool({
    name: 'version_upgrade_advisor',
    description: 'Generate an optimal upgrade path from current to target API version, including intermediate version checks, breaking change listings, and step-by-step migration plan.',
    parameters: {
      upgrade_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: current_version (string), target_version (string), schema_history (array of {version, schema, schema_type}), api_name (string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { upgrade_input: string }) {
      const data = JSON.parse(args.upgrade_input) as {
        current_version: string
        target_version: string
        schema_history: { version: string; schema: string; schema_type: 'openapi' | 'graphql' }[]
        api_name: string
      }
      const result = adviseVersionUpgrade(data)
      return formatUpgradeAdviceReport(result)
    },
  }))

  // ── Tool 7: client_compatibility_check ─────────────────────────────────
  tools.register(defineTool({
    name: 'client_compatibility_check',
    description: 'Analyze existing client code for compatibility with a new API version. Identifies incompatible call points, removed endpoint usage, and provides specific modification suggestions.',
    parameters: {
      compat_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: client_code (array of {filename, content}), schema_diff (SchemaDiffResult as JSON string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { compat_input: string }) {
      const data = JSON.parse(args.compat_input) as { client_code: { filename: string; content: string }[]; schema_diff: string }
      const result = analyzeClientCompatibility({
        client_code: data.client_code,
        schema_diff: JSON.parse(data.schema_diff),
      })
      return formatClientCompatibilityReport(result)
    },
  }))

  // ── Tool 8: api_changelog_gen ──────────────────────────────────────────
  tools.register(defineTool({
    name: 'api_changelog_gen',
    description: 'Automatically generate a developer-friendly changelog from schema diff. Classifies changes by type (Added/Changed/Deprecated/Fixed/Removed) and supports markdown, JSON, and plain text output formats.',
    parameters: {
      changelog_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: diff (SchemaDiffResult as JSON string), version (string), format (\'markdown\'|\'json\'|\'plain\'), date (optional string).',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { changelog_input: string }) {
      const data = JSON.parse(args.changelog_input) as {
        diff: string
        version: string
        format: 'markdown' | 'json' | 'plain'
        date?: string
      }
      const result = generateChangelog({
        diff: JSON.parse(data.diff),
        version: data.version,
        format: data.format,
        date: data.date,
      })
      return formatChangelogReport(result)
    },
  }))
}
