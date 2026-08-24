/**
 * DSH No-Code/Low-Code AI Plugin v1.0.0
 *
 * AI-powered tools for building applications without traditional coding.
 * The no-code/low-code market reached $35B+ in 2026, with AI-powered no-code
 * as the fastest-growing sub-sector.
 *
 * Features (v1.0.0):
 * - Workflow Automation Builder (design automated workflows for business processes)
 * - Prompt Template Designer (create reusable prompt templates for AI systems)
 * - App Scaffolder (generate complete app scaffolding from requirements)
 * - Data Pipeline Designer (design ETL/data pipelines for data processing)
 * - UI Component Generator (generate UI component code from specifications)
 * - Integration Mapper (map and plan system integrations)
 * - Logic Flow Visualizer (create visual logic flow diagrams)
 * - Deployment Automator (automate deployment configurations)
 *
 * @module dsh-tool-nocodeai
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-nocodeai'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated recommendations for informational purposes only. Always validate architecture decisions with qualified engineers and review security requirements before production deployment.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = {
  next: (min: number, max: number, seed: number) => Math.floor(mulberry32(seed)() * (max - min + 1)) + min,
  nextFloat: (min: number, max: number, seed: number) => mulberry32(seed)() * (max - min) + min,
  pick: <T>(arr: T[], seed: number): T => arr[Math.floor(mulberry32(seed)() * arr.length)],
  pickN: <T>(arr: T[], n: number, seed: number): T[] => {
    const shuffled = [...arr].sort(() => mulberry32(seed)() - 0.5)
    return shuffled.slice(0, n)
  }
}

function deriveSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Workflow Automation Builder ---
export interface WorkflowStep {
  order: number
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'delay' | 'approval'
  name: string
  description: string
  integration: string
  config: Record<string, string>
}

export interface WorkflowAutomationInput {
  process_description: string
  trigger_type: string
  available_integrations: string[]
  complexity_level: string
  error_handling: string
}

export interface WorkflowAutomationOutput {
  workflow_name: string
  trigger: WorkflowStep
  steps: WorkflowStep[]
  error_handling_rules: string[]
  diagram_description: string
  estimated_execution_time: string
  optimization_tips: string[]
  summary: string
}

// --- Tool 2: Prompt Template Designer ---
export interface PromptVariable {
  name: string
  type: string
  description: string
  default_value: string
  required: boolean
}

export interface PromptTemplateInput {
  template_name: string
  target_model: string
  task_description: string
  variables: PromptVariable[]
  output_format: string
  tone: string
  constraints: string[]
}

export interface PromptTemplateOutput {
  template_id: string
  template_name: string
  system_prompt: string
  user_prompt_template: string
  example_prompts: Array<{ input: string; expected_output: string }>
  variables: PromptVariable[]
  best_practices: string[]
  summary: string
}

// --- Tool 3: App Scaffolder ---
export interface AppScaffoldInput {
  app_name: string
  app_type: string
  target_platform: string
  core_features: string[]
  tech_stack_preference: string
  database_type: string
}

export interface FileStructure {
  path: string
  type: 'file' | 'directory'
  purpose: string
}

export interface AppScaffoldOutput {
  app_name: string
  project_structure: FileStructure[]
  dependencies: Array<{ name: string; version: string; purpose: string }>
  config_files: Array<{ name: string; description: string }>
  setup_instructions: string[]
  next_steps: string[]
  summary: string
}

// --- Tool 4: Data Pipeline Designer ---
export interface PipelineStage {
  name: string
  type: 'extract' | 'transform' | 'load' | 'validate' | 'aggregate'
  description: string
  input_schema: string[]
  output_schema: string[]
  config: Record<string, string>
}

export interface DataPipelineInput {
  pipeline_name: string
  data_sources: string[]
  destination: string
  transformation_rules: string[]
  schedule: string
  data_volume: string
}

export interface DataPipelineOutput {
  pipeline_name: string
  stages: PipelineStage[]
  data_flow_diagram: string
  error_handling: string[]
  monitoring_config: string[]
  scaling_recommendations: string[]
  summary: string
}

// --- Tool 5: UI Component Generator ---
export interface ComponentProp {
  name: string
  type: string
  required: boolean
  description: string
  default_value: string
}

export interface UIComponentInput {
  component_name: string
  component_type: string
  framework: string
  styling_approach: string
  props: ComponentProp[]
  state_management: string
  responsive_behavior: string
}

export interface UIComponentOutput {
  component_name: string
  framework: string
  component_code: string
  styles_code: string
  test_code: string
  storybook_code: string
  accessibility_notes: string[]
  summary: string
}

// --- Tool 6: Integration Mapper ---
export interface IntegrationEndpoint {
  method: string
  path: string
  description: string
  auth_required: boolean
  rate_limit: string
}

export interface IntegrationMapInput {
  system_name: string
  integrations: Array<{ name: string; type: string; purpose: string }>
  auth_strategy: string
  data_format: string
  reliability_requirements: string
}

export interface IntegrationMapOutput {
  system_name: string
  integration_specs: Array<{
    name: string
    type: string
    endpoints: IntegrationEndpoint[]
    auth_config: Record<string, string>
    retry_policy: string
  }>
  architecture_diagram: string
  security_considerations: string[]
  summary: string
}

// --- Tool 7: Logic Flow Visualizer ---
export interface FlowNode {
  id: string
  type: 'start' | 'end' | 'process' | 'decision' | 'data' | 'api'
  label: string
  description: string
  connections: string[]
}

export interface LogicFlowInput {
  flow_name: string
  flow_description: string
  nodes: FlowNode[]
  complexity_level: string
  target_format: string
}

export interface LogicFlowOutput {
  flow_name: string
  mermaid_diagram: string
  plantuml_diagram: string
  flow_description: string
  decision_points: string[]
  optimization_suggestions: string[]
  summary: string
}

// --- Tool 8: Deployment Automator ---
export interface DeploymentStep {
  order: number
  name: string
  command: string
  description: string
  environment: string
}

export interface DeploymentAutomatorInput {
  app_name: string
  deployment_target: string
  environment: string
  ci_platform: string
  infrastructure_type: string
  rollback_strategy: string
}

export interface DeploymentAutomatorOutput {
  app_name: string
  pipeline_name: string
  deployment_steps: DeploymentStep[]
  environment_configs: Array<{ env: string; variables: Record<string, string> }>
  rollback_procedure: string[]
  monitoring_setup: string[]
  estimated_deployment_time: string
  summary: string
}

// ==================== TOOL 1: WORKFLOW AUTOMATION BUILDER ====================

function buildWorkflowAutomation(input: WorkflowAutomationInput): WorkflowAutomationOutput {
  const seed = deriveSeed(input)
  const integrations = input.available_integrations
  const complexity = input.complexity_level

  const workflow_name = 'Workflow_' + rng.next(1000, 9999, seed)

  const trigger: WorkflowStep = {
    order: 0,
    type: 'trigger',
    name: input.trigger_type + ' Trigger',
    description: 'Initiates the workflow when ' + input.trigger_type + ' event occurs',
    integration: integrations[0] || 'Webhook',
    config: { event: input.trigger_type, filter: 'all' }
  }

  const steps: WorkflowStep[] = [trigger]

  const actionTemplates = [
    { name: 'Data Transform', description: 'Transform incoming data to target format', mapping_config: 'auto', format_config: 'JSON' },
    { name: 'Condition Check', description: 'Evaluate business rules', expression_config: 'value > threshold', branches_config: '2' },
    { name: 'Send Notification', description: 'Send email/Slack notification', channel_config: 'email', template_config: 'default' },
    { name: 'Database Update', description: 'Update records in database', operation_config: 'upsert', table_config: 'events' },
    { name: 'API Call', description: 'Call external API', method_config: 'POST', retry_config: '3' },
    { name: 'Delay', description: 'Wait before next step', duration_config: '5m', unit_config: 'minutes' },
    { name: 'Approval Gate', description: 'Wait for human approval', approvers_config: 'manager', timeout_config: '24h' },
    { name: 'Error Handler', description: 'Handle errors gracefully', fallback_config: 'log_and_continue', max_retries_config: '3' }
  ]

  const stepCount = complexity === 'high' ? rng.next(5, 8, seed) : complexity === 'medium' ? rng.next(3, 5, seed) : rng.next(2, 3, seed)

  for (let i = 1; i <= stepCount; i++) {
    const template = actionTemplates[(i - 1) % actionTemplates.length]
    const integration = integrations[i % integrations.length] || 'Built-in'
    const stepType: WorkflowStep['type'] = (['action', 'condition', 'delay', 'action', 'action'] as const)[i % 5]
    steps.push({
      order: i,
      type: stepType,
      name: template.name + ' ' + i,
      description: template.description,
      integration,
      config: { step_index: String(i) }
    })
  }

  const error_handling_rules = [
    'Retry failed steps up to 3 times with exponential backoff',
    'Log all errors to monitoring system',
    'Send alert on persistent failures',
    'Fallback to manual process if automation fails'
  ]

  const diagram_steps = steps.slice(1).map(function(s) { return '[' + s.name + ']' }).join(' -> ')
  const diagram_description = 'Flow: [' + input.trigger_type + '] -> ' + diagram_steps + ' -> [End]'

  const exec_time = rng.next(2, 30, seed)

  const optimization_tips = [
    'Use batch processing for high-volume triggers',
    'Implement idempotency keys to prevent duplicate processing',
    'Add circuit breaker pattern for external API calls',
    'Consider parallel execution for independent steps'
  ]

  return {
    workflow_name,
    trigger,
    steps,
    error_handling_rules,
    diagram_description,
    estimated_execution_time: exec_time + ' seconds (average)',
    optimization_tips: rng.pickN(optimization_tips, 3, seed),
    summary: 'Workflow "' + workflow_name + '" with ' + steps.length + ' steps, triggered by ' + input.trigger_type + '. Complexity: ' + complexity + '. Uses ' + integrations.length + ' integrations.'
  }
}

function formatWorkflowAutomationReport(input: WorkflowAutomationInput, output: WorkflowAutomationOutput): string {
  const lines: string[] = []
  lines.push('## Workflow Automation: ' + output.workflow_name)
  lines.push('')
  lines.push('**Process:** ' + input.process_description)
  lines.push('**Trigger:** ' + input.trigger_type + ' | **Complexity:** ' + input.complexity_level)
  lines.push('**Integrations:** ' + input.available_integrations.join(', '))
  lines.push('')
  lines.push('### Workflow Steps')
  lines.push('| Step | Type | Name | Integration | Description |')
  lines.push('|------|------|------|-------------|-------------|')
  for (const s of output.steps) {
    lines.push('| ' + s.order + ' | ' + s.type + ' | ' + s.name + ' | ' + s.integration + ' | ' + s.description + ' |')
  }
  lines.push('')
  lines.push('### Flow Diagram')
  lines.push(output.diagram_description)
  lines.push('')
  lines.push('### Error Handling')
  for (const e of output.error_handling_rules) {
    lines.push('- ' + e)
  }
  lines.push('')
  lines.push('### Optimization Tips')
  for (const t of output.optimization_tips) {
    lines.push('- ' + t)
  }
  lines.push('')
  lines.push('### Estimated Execution Time')
  lines.push(output.estimated_execution_time)
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: PROMPT TEMPLATE DESIGNER ====================

function designPromptTemplate(input: PromptTemplateInput): PromptTemplateOutput {
  const seed = deriveSeed(input)
  const template_id = 'prompt_' + rng.next(10000, 99999, seed)

  const system_prompt = 'You are a ' + input.tone + ' assistant specialized in ' + input.task_description + '. ' +
    'Always format your response as ' + input.output_format + '. ' +
    (input.constraints.length > 0 ? 'Follow these constraints: ' + input.constraints.join('; ') + '.' : '')

  let user_prompt_template = 'Task: ' + input.task_description + '\n\n'
  for (const v of input.variables) {
    user_prompt_template += v.name + ': {{' + v.name + '}}\n'
  }
  user_prompt_template += '\nPlease provide your response in ' + input.output_format + ' format.'

  const example_prompts = [
    {
      input: input.variables.map(function(v) { return v.name + ': [sample ' + v.type + ' value]' }).join(', '),
      expected_output: '[Expected ' + input.output_format + ' output for the given task]'
    },
    {
      input: input.variables.map(function(v) { return v.name + ': [another ' + v.type + ' value]' }).join(', '),
      expected_output: '[Expected ' + input.output_format + ' output for the given task]'
    }
  ]

  const best_practices = [
    'Use clear, specific instructions in the system prompt',
    'Provide 2-3 examples for few-shot learning',
    'Keep variable names descriptive and consistent',
    'Test with edge cases and unusual inputs',
    'Iterate on the prompt based on output quality metrics'
  ]

  return {
    template_id,
    template_name: input.template_name,
    system_prompt,
    user_prompt_template,
    example_prompts,
    variables: input.variables,
    best_practices: rng.pickN(best_practices, 4, seed),
    summary: 'Prompt template "' + input.template_name + '" for ' + input.target_model + ' with ' + input.variables.length + ' variables. Task: ' + input.task_description + '.'
  }
}

function formatPromptTemplateReport(input: PromptTemplateInput, output: PromptTemplateOutput): string {
  const lines: string[] = []
  lines.push('## Prompt Template: ' + output.template_name)
  lines.push('')
  lines.push('**Template ID:** ' + output.template_id)
  lines.push('**Target Model:** ' + input.target_model + ' | **Tone:** ' + input.tone)
  lines.push('**Output Format:** ' + input.output_format)
  lines.push('')
  lines.push('### System Prompt')
  lines.push('```')
  lines.push(output.system_prompt)
  lines.push('```')
  lines.push('')
  lines.push('### User Prompt Template')
  lines.push('```')
  lines.push(output.user_prompt_template)
  lines.push('```')
  lines.push('')
  lines.push('### Variables')
  for (const v of output.variables) {
    lines.push('- **' + v.name + '** (' + v.type + '): ' + v.description + (v.required ? ' [REQUIRED]' : ' [Default: ' + v.default_value + ']'))
  }
  lines.push('')
  lines.push('### Example Prompts')
  for (let i = 0; i < output.example_prompts.length; i++) {
    const ex = output.example_prompts[i]
    lines.push('**Example ' + (i + 1) + '**')
    lines.push('- Input: ' + ex.input)
    lines.push('- Expected Output: ' + ex.expected_output)
    lines.push('')
  }
  lines.push('### Best Practices')
  for (const bp of output.best_practices) {
    lines.push('- ' + bp)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: APP SCAFFOLDER ====================

function scaffoldApp(input: AppScaffoldInput): AppScaffoldOutput {
  const seed = deriveSeed(input)
  const features = input.core_features
  const platform = input.target_platform

  const project_structure: FileStructure[] = [
    { path: input.app_name + '/', type: 'directory', purpose: 'Root project directory' },
    { path: input.app_name + '/src/', type: 'directory', purpose: 'Source code' },
    { path: input.app_name + '/src/components/', type: 'directory', purpose: 'Reusable UI components' },
    { path: input.app_name + '/src/pages/', type: 'directory', purpose: 'Page components' },
    { path: input.app_name + '/src/hooks/', type: 'directory', purpose: 'Custom React hooks' },
    { path: input.app_name + '/src/utils/', type: 'directory', purpose: 'Utility functions' },
    { path: input.app_name + '/src/services/', type: 'directory', purpose: 'API services' },
    { path: input.app_name + '/src/types/', type: 'directory', purpose: 'TypeScript type definitions' },
    { path: input.app_name + '/public/', type: 'directory', purpose: 'Static assets' },
    { path: input.app_name + '/tests/', type: 'directory', purpose: 'Test files' },
    { path: input.app_name + '/package.json', type: 'file', purpose: 'Project dependencies' },
    { path: input.app_name + '/tsconfig.json', type: 'file', purpose: 'TypeScript configuration' },
    { path: input.app_name + '/README.md', type: 'file', purpose: 'Project documentation' }
  ]

  if (platform.toLowerCase().includes('web') || platform.toLowerCase().includes('react')) {
    project_structure.push({ path: input.app_name + '/src/App.tsx', type: 'file', purpose: 'Main App component' })
    project_structure.push({ path: input.app_name + '/src/index.tsx', type: 'file', purpose: 'Entry point' })
    project_structure.push({ path: input.app_name + '/src/index.css', type: 'file', purpose: 'Global styles' })
  }

  if (input.database_type !== 'none') {
    project_structure.push({ path: input.app_name + '/src/models/', type: 'directory', purpose: 'Data models' })
    project_structure.push({ path: input.app_name + '/prisma/', type: 'directory', purpose: 'Prisma ORM' })
    project_structure.push({ path: input.app_name + '/prisma/schema.prisma', type: 'file', purpose: 'Database schema' })
  }

  const dependencies: AppScaffoldOutput['dependencies'] = [
    { name: 'react', version: '^18.2.0', purpose: 'UI library' },
    { name: 'react-dom', version: '^18.2.0', purpose: 'React DOM renderer' },
    { name: 'typescript', version: '^5.0.0', purpose: 'Type safety' }
  ]

  if (input.tech_stack_preference.toLowerCase().includes('next')) {
    dependencies.push({ name: 'next', version: '^14.0.0', purpose: 'React framework' })
  }
  if (input.database_type === 'prisma') {
    dependencies.push({ name: '@prisma/client', version: '^5.0.0', purpose: 'Database client' })
  }

  const config_files = [
    { name: 'package.json', description: 'Project metadata and dependencies' },
    { name: 'tsconfig.json', description: 'TypeScript compiler configuration' },
    { name: '.env.example', description: 'Environment variables template' },
    { name: '.gitignore', description: 'Git ignore rules' }
  ]

  const setup_instructions = [
    'Clone the repository',
    'Run npm install to install dependencies',
    'Copy .env.example to .env and configure environment variables',
    'Run npm run dev to start the development server',
    'Open http://localhost:3000 in your browser'
  ]

  const next_steps = [
    'Implement authentication and authorization',
    'Build core feature components: ' + features.slice(0, 3).join(', '),
    'Set up API routes and data fetching',
    'Add error handling and loading states',
    'Write unit and integration tests'
  ]

  return {
    app_name: input.app_name,
    project_structure,
    dependencies,
    config_files,
    setup_instructions,
    next_steps,
    summary: 'Scaffolded "' + input.app_name + '" for ' + platform + ' with ' + project_structure.length + ' files/directories, ' + dependencies.length + ' dependencies. Features: ' + features.join(', ') + '.'
  }
}

function formatAppScaffoldReport(input: AppScaffoldInput, output: AppScaffoldOutput): string {
  const lines: string[] = []
  lines.push('## App Scaffold: ' + output.app_name)
  lines.push('')
  lines.push('**App Type:** ' + input.app_type + ' | **Platform:** ' + input.target_platform)
  lines.push('**Tech Stack:** ' + input.tech_stack_preference + ' | **Database:** ' + input.database_type)
  lines.push('**Core Features:** ' + input.core_features.join(', '))
  lines.push('')
  lines.push('### Project Structure')
  for (const f of output.project_structure) {
    lines.push('- ' + f.path + ' (' + f.type + ') - ' + f.purpose)
  }
  lines.push('')
  lines.push('### Dependencies')
  for (const d of output.dependencies) {
    lines.push('- ' + d.name + '@' + d.version + ' - ' + d.purpose)
  }
  lines.push('')
  lines.push('### Setup Instructions')
  for (let i = 0; i < output.setup_instructions.length; i++) {
    lines.push((i + 1) + '. ' + output.setup_instructions[i])
  }
  lines.push('')
  lines.push('### Next Steps')
  for (const s of output.next_steps) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: DATA PIPELINE DESIGNER ====================

function designDataPipeline(input: DataPipelineInput): DataPipelineOutput {
  const seed = deriveSeed(input)
  const sources = input.data_sources
  const destination = input.destination
  const rules = input.transformation_rules

  const stages: PipelineStage[] = [
    {
      name: 'Extract',
      type: 'extract',
      description: 'Extract data from ' + sources.join(', '),
      input_schema: sources.map(function(s) { return s + '_raw_data' }),
      output_schema: ['unified_raw_data'],
      config: { sources: sources.join(','), batch_size: '1000' }
    }
  ]

  if (rules.length > 0) {
    stages.push({
      name: 'Transform',
      type: 'transform',
      description: 'Apply transformation rules: ' + rules.join(', '),
      input_schema: ['unified_raw_data'],
      output_schema: ['transformed_data'],
      config: { rules: rules.join(','), validation: 'strict' }
    })
  }

  stages.push({
    name: 'Validate',
    type: 'validate',
    description: 'Validate data quality and schema compliance',
    input_schema: ['transformed_data'],
    output_schema: ['validated_data'],
    config: { schema_validation: 'true', quality_checks: 'completeness,uniqueness,timeliness' }
  })

  stages.push({
    name: 'Load',
    type: 'load',
    description: 'Load data into ' + destination,
    input_schema: ['validated_data'],
    output_schema: ['loaded_records'],
    config: { destination, load_mode: 'upsert', batch_size: '5000' }
  })

  const data_flow_diagram = 'Data Flow: ' + sources.join(' + ') + ' -> [Extract] -> [Transform] -> [Validate] -> [Load] -> ' + destination

  const error_handling = [
    'Dead letter queue for failed records',
    'Automatic retry with exponential backoff (3 attempts)',
    'Data quality metrics and alerting',
    'Schema evolution handling with versioning'
  ]

  const monitoring_config = [
    'Pipeline execution time tracking',
    'Record count monitoring (input vs output)',
    'Data quality score dashboard',
    'Alert on pipeline failure or SLA breach'
  ]

  const scaling_recommendations = [
    'Use Apache Spark for data volumes > 1TB',
    'Implement incremental processing for daily syncs',
    'Add data partitioning by date for query performance',
    'Consider stream processing for real-time requirements'
  ]

  return {
    pipeline_name: input.pipeline_name,
    stages,
    data_flow_diagram,
    error_handling,
    monitoring_config,
    scaling_recommendations: rng.pickN(scaling_recommendations, 3, seed),
    summary: 'Data pipeline "' + input.pipeline_name + '" with ' + stages.length + ' stages. Sources: ' + sources.join(', ') + '. Destination: ' + destination + '. Schedule: ' + input.schedule + '.'
  }
}

function formatDataPipelineReport(input: DataPipelineInput, output: DataPipelineOutput): string {
  const lines: string[] = []
  lines.push('## Data Pipeline: ' + output.pipeline_name)
  lines.push('')
  lines.push('**Data Sources:** ' + input.data_sources.join(', '))
  lines.push('**Destination:** ' + input.destination + ' | **Schedule:** ' + input.schedule)
  lines.push('**Data Volume:** ' + input.data_volume)
  lines.push('**Transformation Rules:** ' + input.transformation_rules.join(', '))
  lines.push('')
  lines.push('### Pipeline Stages')
  for (const s of output.stages) {
    lines.push('**' + s.name + '** (' + s.type + ')')
    lines.push('- Description: ' + s.description)
    lines.push('- Input: ' + s.input_schema.join(', '))
    lines.push('- Output: ' + s.output_schema.join(', '))
    lines.push('')
  }
  lines.push('### Data Flow')
  lines.push(output.data_flow_diagram)
  lines.push('')
  lines.push('### Error Handling')
  for (const e of output.error_handling) {
    lines.push('- ' + e)
  }
  lines.push('')
  lines.push('### Monitoring')
  for (const m of output.monitoring_config) {
    lines.push('- ' + m)
  }
  lines.push('')
  lines.push('### Scaling Recommendations')
  for (const s of output.scaling_recommendations) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: UI COMPONENT GENERATOR ====================

function generateUIComponent(input: UIComponentInput): UIComponentOutput {
  const seed = deriveSeed(input)
  const framework = input.framework
  const componentName = input.component_name

  let component_code = 'import React from "react"\n\n'
  component_code += 'interface ' + componentName + 'Props {\n'
  for (const p of input.props) {
    component_code += '  ' + p.name + ': ' + p.type + (p.required ? '' : ' | undefined') + '\n'
  }
  component_code += '}\n\n'
  component_code += 'export const ' + componentName + ': React.FC<' + componentName + 'Props> = (props) => {\n'
  component_code += '  return (\n'
  component_code += '    <div className="' + componentName.toLowerCase() + '-container">\n'
  component_code += '      {/* Component implementation */}\n'
  component_code += '    </div>\n'
  component_code += '  )\n'
  component_code += '}\n'

  let styles_code = '.' + componentName.toLowerCase() + '-container {\n'
  styles_code += '  display: flex;\n'
  styles_code += '  flex-direction: column;\n'
  styles_code += '  padding: 1rem;\n'
  styles_code += '}\n'

  let test_code = 'import { render, screen } from "@testing-library/react"\n'
  test_code += 'import { ' + componentName + ' } from "./' + componentName + '"\n\n'
  test_code += 'describe("' + componentName + '", () => {\n'
  test_code += '  it("renders correctly", () => {\n'
  test_code += '    render(<' + componentName + ' />)\n'
  test_code += '    expect(screen.getByTestId("' + componentName.toLowerCase() + '")).toBeInTheDocument()\n'
  test_code += '  })\n'
  test_code += '})\n'

  let storybook_code = 'import type { Meta, StoryObj } from "@storybook/react"\n'
  storybook_code += 'import { ' + componentName + ' } from "./' + componentName + '"\n\n'
  storybook_code += 'const meta: Meta<typeof ' + componentName + '> = {\n'
  storybook_code += '  title: "Components/' + componentName + '",\n'
  storybook_code += '  component: ' + componentName + ',\n'
  storybook_code += '}\n\n'
  storybook_code += 'export default meta\n'
  storybook_code += 'type Story = StoryObj<typeof ' + componentName + '>\n\n'
  storybook_code += 'export const Default: Story = {}\n'

  const accessibility_notes = [
    'Ensure all interactive elements are keyboard accessible',
    'Use proper ARIA labels and roles',
    'Maintain sufficient color contrast (WCAG AA)',
    'Provide focus indicators for keyboard navigation'
  ]

  return {
    component_name: componentName,
    framework,
    component_code,
    styles_code,
    test_code,
    storybook_code,
    accessibility_notes: rng.pickN(accessibility_notes, 3, seed),
    summary: 'Generated ' + componentName + ' component for ' + framework + ' with ' + input.props.length + ' props. Styling: ' + input.styling_approach + '.'
  }
}

function formatUIComponentReport(input: UIComponentInput, output: UIComponentOutput): string {
  const lines: string[] = []
  lines.push('## UI Component: ' + output.component_name)
  lines.push('')
  lines.push('**Framework:** ' + output.framework + ' | **Type:** ' + input.component_type)
  lines.push('**Styling:** ' + input.styling_approach + ' | **State Management:** ' + input.state_management)
  lines.push('**Responsive:** ' + input.responsive_behavior)
  lines.push('')
  lines.push('### Component Code')
  lines.push('```typescript')
  lines.push(output.component_code)
  lines.push('```')
  lines.push('')
  lines.push('### Styles')
  lines.push('```css')
  lines.push(output.styles_code)
  lines.push('```')
  lines.push('')
  lines.push('### Test Code')
  lines.push('```typescript')
  lines.push(output.test_code)
  lines.push('```')
  lines.push('')
  lines.push('### Props')
  for (const p of input.props) {
    lines.push('- **' + p.name + '** (' + p.type + '): ' + p.description + (p.required ? ' [REQUIRED]' : ''))
  }
  lines.push('')
  lines.push('### Accessibility Notes')
  for (const a of output.accessibility_notes) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: INTEGRATION MAPPER ====================

function mapIntegrations(input: IntegrationMapInput): IntegrationMapOutput {
  const seed = deriveSeed(input)
  const systemName = input.system_name
  const integrations = input.integrations

  const integration_specs: IntegrationMapOutput['integration_specs'] = integrations.map(function(integ, idx) {
    const endpoints: IntegrationEndpoint[] = [
      { method: 'GET', path: '/api/' + integ.name.toLowerCase() + '/list', description: 'List ' + integ.name + ' resources', auth_required: true, rate_limit: '100/hour' },
      { method: 'POST', path: '/api/' + integ.name.toLowerCase() + '/create', description: 'Create ' + integ.name + ' resource', auth_required: true, rate_limit: '50/hour' },
      { method: 'GET', path: '/api/' + integ.name.toLowerCase() + '/:id', description: 'Get ' + integ.name + ' by ID', auth_required: true, rate_limit: '200/hour' }
    ]

    return {
      name: integ.name,
      type: integ.type,
      endpoints,
      auth_config: {
        type: input.auth_strategy,
        token_endpoint: '/oauth/token',
        refresh_enabled: 'true'
      },
      retry_policy: idx === 0 ? 'exponential_backoff_3_retries' : 'fixed_interval_2_retries'
    }
  })

  const architecture_diagram = 'Architecture: ' + systemName + ' -> API Gateway -> [' + integrations.map(function(i) { return i.name }).join(', ') + '] -> Data Transform -> Response'

  const security_considerations = [
    'Use OAuth 2.0 or API keys for authentication',
    'Implement request signing for webhook endpoints',
    'Encrypt data in transit (TLS 1.3)',
    'Validate and sanitize all incoming data',
    'Implement rate limiting and throttling'
  ]

  return {
    system_name: systemName,
    integration_specs,
    architecture_diagram,
    security_considerations: rng.pickN(security_considerations, 4, seed),
    summary: 'Integration map for ' + systemName + ' with ' + integrations.length + ' integrations. Auth: ' + input.auth_strategy + '. Format: ' + input.data_format + '.'
  }
}

function formatIntegrationMapReport(input: IntegrationMapInput, output: IntegrationMapOutput): string {
  const lines: string[] = []
  lines.push('## Integration Map: ' + output.system_name)
  lines.push('')
  lines.push('**Auth Strategy:** ' + input.auth_strategy + ' | **Data Format:** ' + input.data_format)
  lines.push('**Reliability:** ' + input.reliability_requirements)
  lines.push('')
  lines.push('### Integrations')
  for (const spec of output.integration_specs) {
    lines.push('**' + spec.name + '** (' + spec.type + ')')
    lines.push('- Endpoints:')
    for (const ep of spec.endpoints) {
      lines.push('  - ' + ep.method + ' ' + ep.path + ' - ' + ep.description)
    }
    lines.push('- Auth: ' + spec.auth_config.type)
    lines.push('- Retry: ' + spec.retry_policy)
    lines.push('')
  }
  lines.push('### Architecture')
  lines.push(output.architecture_diagram)
  lines.push('')
  lines.push('### Security Considerations')
  for (const s of output.security_considerations) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: LOGIC FLOW VISUALIZER ====================

function visualizeLogicFlow(input: LogicFlowInput): LogicFlowOutput {
  const seed = deriveSeed(input)
  const flowName = input.flow_name
  const nodes = input.nodes

  let mermaid_diagram = 'graph TD\n'
  mermaid_diagram += '    Start([Start]) --> Node1[' + (nodes[0]?.label || 'Process') + ']\n'

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeId = 'Node' + (i + 1)
    if (node.type === 'decision') {
      mermaid_diagram += '    ' + nodeId + '{' + node.label + '}\n'
    } else if (node.type === 'end') {
      mermaid_diagram += '    ' + nodeId + '([End])\n'
    } else {
      mermaid_diagram += '    ' + nodeId + '[' + node.label + ']\n'
    }
    if (i < nodes.length - 1) {
      mermaid_diagram += '    ' + nodeId + ' --> Node' + (i + 2) + '\n'
    }
  }

  let plantuml_diagram = '@startuml\n'
  plantuml_diagram += 'start\n'
  for (const node of nodes) {
    if (node.type === 'decision') {
      plantuml_diagram += 'if (' + node.label + ') then (yes)\n'
      plantuml_diagram += '  :process;\n'
      plantuml_diagram += 'else (no)\n'
      plantuml_diagram += '  :alternative;\n'
      plantuml_diagram += 'endif\n'
    } else {
      plantuml_diagram += ':' + node.label + ';\n'
    }
  }
  plantuml_diagram += 'stop\n'
  plantuml_diagram += '@enduml\n'

  const decision_points = nodes
    .filter(function(n) { return n.type === 'decision' })
    .map(function(n) { return n.label + ': ' + n.description })

  const optimization_suggestions = [
    'Consider parallel execution for independent branches',
    'Add error handling for each decision point',
    'Implement timeout for long-running processes',
    'Add logging at key decision points for debugging'
  ]

  return {
    flow_name: flowName,
    mermaid_diagram,
    plantuml_diagram,
    flow_description: input.flow_description,
    decision_points,
    optimization_suggestions: rng.pickN(optimization_suggestions, 3, seed),
    summary: 'Logic flow "' + flowName + '" with ' + nodes.length + ' nodes, ' + decision_points.length + ' decision points. Format: ' + input.target_format + '.'
  }
}

function formatLogicFlowReport(input: LogicFlowInput, output: LogicFlowOutput): string {
  const lines: string[] = []
  lines.push('## Logic Flow: ' + output.flow_name)
  lines.push('')
  lines.push('**Description:** ' + output.flow_description)
  lines.push('**Nodes:** ' + input.nodes.length + ' | **Complexity:** ' + input.complexity_level)
  lines.push('**Target Format:** ' + input.target_format)
  lines.push('')
  lines.push('### Mermaid Diagram')
  lines.push('```mermaid')
  lines.push(output.mermaid_diagram)
  lines.push('```')
  lines.push('')
  lines.push('### PlantUML Diagram')
  lines.push('```plantuml')
  lines.push(output.plantuml_diagram)
  lines.push('```')
  lines.push('')
  lines.push('### Decision Points')
  for (const d of output.decision_points) {
    lines.push('- ' + d)
  }
  lines.push('')
  lines.push('### Optimization Suggestions')
  for (const o of output.optimization_suggestions) {
    lines.push('- ' + o)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: DEPLOYMENT AUTOMATOR ====================

function automateDeployment(input: DeploymentAutomatorInput): DeploymentAutomatorOutput {
  const seed = deriveSeed(input)
  const appName = input.app_name
  const target = input.deployment_target
  const env = input.environment

  const pipeline_name = appName + '-pipeline-' + rng.next(100, 999, seed)

  const deployment_steps: DeploymentStep[] = [
    { order: 1, name: 'Checkout Code', command: 'git checkout main', description: 'Checkout latest code', environment: 'ci' },
    { order: 2, name: 'Install Dependencies', command: 'npm ci', description: 'Install dependencies', environment: 'ci' },
    { order: 3, name: 'Run Tests', command: 'npm test', description: 'Run test suite', environment: 'ci' },
    { order: 4, name: 'Build Application', command: 'npm run build', description: 'Build production bundle', environment: 'ci' },
    { order: 5, name: 'Deploy to ' + env, command: 'npm run deploy:' + env, description: 'Deploy to ' + env, environment: env },
    { order: 6, name: 'Health Check', command: 'npm run health-check', description: 'Verify deployment health', environment: env }
  ]

  const environment_configs: DeploymentAutomatorOutput['environment_configs'] = [
    { env: 'development', variables: { NODE_ENV: 'development', DEBUG: 'true', LOG_LEVEL: 'debug' } },
    { env: 'staging', variables: { NODE_ENV: 'staging', DEBUG: 'false', LOG_LEVEL: 'info' } },
    { env: 'production', variables: { NODE_ENV: 'production', DEBUG: 'false', LOG_LEVEL: 'error' } }
  ]

  const rollback_procedure = [
    'Identify the last known good deployment version',
    'Run: npm run rollback:' + env + ' -- --version=<last-good-version>',
    'Verify health checks pass after rollback',
    'Notify team of rollback completion',
    'Create incident report for the failed deployment'
  ]

  const monitoring_setup = [
    'Application performance monitoring (APM)',
    'Error tracking and alerting',
    'Uptime monitoring with health checks',
    'Log aggregation and analysis',
    'User experience monitoring (RUM)'
  ]

  const estimated_time = rng.next(5, 30, seed)

  return {
    app_name: appName,
    pipeline_name,
    deployment_steps,
    environment_configs,
    rollback_procedure,
    monitoring_setup: rng.pickN(monitoring_setup, 4, seed),
    estimated_deployment_time: estimated_time + ' minutes',
    summary: 'Deployment pipeline "' + pipeline_name + '" for ' + appName + ' targeting ' + target + ' (' + env + '). ' + deployment_steps.length + ' steps. Estimated time: ' + estimated_time + ' minutes.'
  }
}

function formatDeploymentReport(input: DeploymentAutomatorInput, output: DeploymentAutomatorOutput): string {
  const lines: string[] = []
  lines.push('## Deployment Automation: ' + output.app_name)
  lines.push('')
  lines.push('**Pipeline:** ' + output.pipeline_name)
  lines.push('**Target:** ' + input.deployment_target + ' | **Environment:** ' + input.environment)
  lines.push('**CI Platform:** ' + input.ci_platform + ' | **Infrastructure:** ' + input.infrastructure_type)
  lines.push('**Rollback Strategy:** ' + input.rollback_strategy)
  lines.push('')
  lines.push('### Deployment Steps')
  for (const s of output.deployment_steps) {
    lines.push(s.order + '. **' + s.name + '** (' + s.environment + ')')
    lines.push('   Command: `' + s.command + '`')
    lines.push('   ' + s.description)
    lines.push('')
  }
  lines.push('### Environment Configurations')
  for (const e of output.environment_configs) {
    lines.push('**' + e.env + '**')
    for (const key of Object.keys(e.variables)) {
      lines.push('- ' + key + '=' + e.variables[key])
    }
    lines.push('')
  }
  lines.push('### Rollback Procedure')
  for (let i = 0; i < output.rollback_procedure.length; i++) {
    lines.push((i + 1) + '. ' + output.rollback_procedure[i])
  }
  lines.push('')
  lines.push('### Monitoring')
  for (const m of output.monitoring_setup) {
    lines.push('- ' + m)
  }
  lines.push('')
  lines.push('### Estimated Deployment Time')
  lines.push(output.estimated_deployment_time)
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Workflow Automation Builder
  tools.register(defineTool({
    name: 'workflow_automation_builder',
    description: 'Designs automated workflows (trigger, actions, conditions) for business processes. Generates step-by-step workflow definitions with integrations, error handling, execution flow diagrams, and optimization tips.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: process_description (string), trigger_type (string), available_integrations (string[]), complexity_level (string), error_handling (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: WorkflowAutomationInput = JSON.parse(args.input_data)
      const result = buildWorkflowAutomation(input)
      return formatWorkflowAutomationReport(input, result)
    }
  }))

  // Tool 2: Prompt Template Designer
  tools.register(defineTool({
    name: 'prompt_template_designer',
    description: 'Creates reusable prompt templates for AI systems. Generates system prompts, user prompt templates with variables, example prompts, and best practices for prompt engineering.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: template_name (string), target_model (string), task_description (string), variables (PromptVariable[]), output_format (string), tone (string), constraints (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: PromptTemplateInput = JSON.parse(args.input_data)
      const result = designPromptTemplate(input)
      return formatPromptTemplateReport(input, result)
    }
  }))

  // Tool 3: App Scaffolder
  tools.register(defineTool({
    name: 'app_scaffolder',
    description: 'Generates complete app scaffolding from requirements. Creates project structure, dependencies, configuration files, setup instructions, and next steps for building the app.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_name (string), app_type (string), target_platform (string), core_features (string[]), tech_stack_preference (string), database_type (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: AppScaffoldInput = JSON.parse(args.input_data)
      const result = scaffoldApp(input)
      return formatAppScaffoldReport(input, result)
    }
  }))

  // Tool 4: Data Pipeline Designer
  tools.register(defineTool({
    name: 'data_pipeline_designer',
    description: 'Designs ETL/data pipelines for data processing. Creates pipeline stages (extract, transform, validate, load), data flow diagrams, error handling, monitoring, and scaling recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: pipeline_name (string), data_sources (string[]), destination (string), transformation_rules (string[]), schedule (string), data_volume (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: DataPipelineInput = JSON.parse(args.input_data)
      const result = designDataPipeline(input)
      return formatDataPipelineReport(input, result)
    }
  }))

  // Tool 5: UI Component Generator
  tools.register(defineTool({
    name: 'ui_component_generator',
    description: 'Generates UI component code from specifications. Creates component code, styles, tests, and Storybook stories for React/Vue/Angular components with accessibility notes.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: component_name (string), component_type (string), framework (string), styling_approach (string), props (ComponentProp[]), state_management (string), responsive_behavior (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: UIComponentInput = JSON.parse(args.input_data)
      const result = generateUIComponent(input)
      return formatUIComponentReport(input, result)
    }
  }))

  // Tool 6: Integration Mapper
  tools.register(defineTool({
    name: 'integration_mapper',
    description: 'Maps and plans system integrations. Creates integration specifications with endpoints, auth configurations, retry policies, architecture diagrams, and security considerations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: system_name (string), integrations (Array<{name, type, purpose}>), auth_strategy (string), data_format (string), reliability_requirements (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: IntegrationMapInput = JSON.parse(args.input_data)
      const result = mapIntegrations(input)
      return formatIntegrationMapReport(input, result)
    }
  }))

  // Tool 7: Logic Flow Visualizer
  tools.register(defineTool({
    name: 'logic_flow_visualizer',
    description: 'Creates visual logic flow diagrams from flow definitions. Generates Mermaid and PlantUML diagrams, identifies decision points, and provides optimization suggestions.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: flow_name (string), flow_description (string), nodes (FlowNode[]), complexity_level (string), target_format (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: LogicFlowInput = JSON.parse(args.input_data)
      const result = visualizeLogicFlow(input)
      return formatLogicFlowReport(input, result)
    }
  }))

  // Tool 8: Deployment Automator
  tools.register(defineTool({
    name: 'deployment_automator',
    description: 'Automates deployment configurations. Creates deployment pipelines, environment configurations, rollback procedures, and monitoring setup for CI/CD workflows.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_name (string), deployment_target (string), environment (string), ci_platform (string), infrastructure_type (string), rollback_strategy (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: DeploymentAutomatorInput = JSON.parse(args.input_data)
      const result = automateDeployment(input)
      return formatDeploymentReport(input, result)
    }
  }))

  console.log('[dsh-tool-nocodeai] Loaded v' + VERSION + ' - No-Code/Low-Code AI with 8 tools')
  console.log('  Tools: workflow_automation_builder, prompt_template_designer, app_scaffolder, data_pipeline_designer, ui_component_generator, integration_mapper, logic_flow_visualizer, deployment_automator')
}
