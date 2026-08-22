/**
 * DSH No-Code/Low-Code Engine Plugin v1.0.0
 *
 * Tools for building applications without traditional coding, inspired by platforms
 * like BaiDu MiaoDa (33.4% market share, 35M users, 3.5M apps created), Dify, n8n,
 * and the broader no-code movement that enables OPC (One Person Company) founders
 * to build products solo.
 *
 * Features (v1.0.0):
 * - App Blueprint Generator (generate complete app blueprints from natural language)
 * - Workflow Automator Designer (design automated workflows for business processes)
 * - Data Model Designer (design database schema for no-code apps)
 * - UI Component Selector (recommend optimal UI components and layouts)
 * - API Integration Planner (plan API integrations needed for an app)
 * - Deployment Configurator (generate deployment configurations)
 * - Permission Model Designer (design user roles and permission matrices)
 * - Analytics Dashboard Planner (plan analytics dashboards with KPIs and alerts)
 *
 * @module dsh-tool-nocodeengine
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-nocodeengine'
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

// --- Tool 1: App Blueprint Generator ---
interface AppBlueprintInput {
  app_description: string
  target_platform: string
  user_type: string
  core_features: string[]
}

interface ScreenDef {
  name: string
  purpose: string
  components: string[]
  user_actions: string[]
}

interface DataModelDef {
  entities: Array<{ name: string; fields: string[]; relationships: string[] }>
}

interface UserFlowDef {
  name: string
  steps: string[]
}

interface AppBlueprintOutput {
  app_name: string
  platform: string
  screens: ScreenDef[]
  data_model: DataModelDef
  user_flows: UserFlowDef[]
  architecture_diagram: string
  tech_stack_recommendations: string[]
  estimated_build_time: string
  summary: string
}

// --- Tool 2: Workflow Automator Designer ---
interface WorkflowAutomatorInput {
  process_description: string
  trigger_type: string
  available_integrations: string[]
  complexity_level: string
}

interface WorkflowStep {
  order: number
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'delay'
  name: string
  description: string
  integration: string
  config: Record<string, string>
}

interface WorkflowAutomatorOutput {
  workflow_name: string
  trigger: WorkflowStep
  steps: WorkflowStep[]
  error_handling: string[]
  diagram_description: string
  estimated_execution_time: string
  optimization_tips: string[]
  summary: string
}

// --- Tool 3: Data Model Designer ---
interface DataModelInput {
  app_type: string
  core_entities: string[]
  scale_requirements: string
  access_patterns: string[]
}

interface EntityField {
  name: string
  type: string
  required: boolean
  indexed: boolean
  description: string
}

interface EntityDef {
  name: string
  fields: EntityField[]
  relationships: Array<{ type: string; target: string; field: string }>
}

interface DataModelOutput {
  entities: EntityDef[]
  indexes: Array<{ entity: string; fields: string[]; type: string }>
  diagram_description: string
  normalization_level: string
  scaling_notes: string[]
  summary: string
}

// --- Tool 4: UI Component Selector ---
interface UIComponentInput {
  screen_type: string
  user_goal: string
  data_to_display: string[]
  interaction_patterns: string[]
}

interface ComponentRecommendation {
  component_type: string
  purpose: string
  library_suggestion: string
  props: string[]
  accessibility_notes: string
}

interface LayoutRecommendation {
  pattern: string
  description: string
  responsive_behavior: string
  sections: string[]
}

interface UIComponentOutput {
  screen_name: string
  layout: LayoutRecommendation
  components: ComponentRecommendation[]
  design_system: string
  interaction_flow: string
  accessibility_score: number
  summary: string
}

// --- Tool 5: API Integration Planner ---
interface APIIntegrationInput {
  app_requirements: string[]
  available_apis: string[]
  auth_method: string
  rate_limits_aware: boolean
}

interface APIIntegration {
  name: string
  purpose: string
  auth_type: string
  endpoints: Array<{ method: string; path: string; description: string }>
  rate_limit: string
  fallback_strategy: string
}

interface APIIntegrationOutput {
  integrations: APIIntegration[]
  auth_flow_description: string
  data_flow_diagram: string
  error_handling_strategy: string
  caching_recommendations: string[]
  security_notes: string[]
  summary: string
}

// --- Tool 6: Deployment Configurator ---
interface DeploymentConfigInput {
  app_type: string
  expected_users: number
  data_sensitivity: string
  budget_usd_month: number
}

interface DeploymentOutput {
  hosting_recommendation: string
  cdn_config: { provider: string; strategy: string; cache_ttl: string }
  environment_variables: Array<{ name: string; description: string; sensitive: boolean }>
  scaling_config: { min_instances: number; max_instances: number; metric: string; threshold: string }
  estimated_monthly_cost: number
  deployment_diagram: string
  ci_cd_recommendation: string
  monitoring_setup: string[]
  summary: string
}

// --- Tool 7: Permission Model Designer ---
interface PermissionModelInput {
  app_type: string
  user_roles: string[]
  data_sensitivity: string
  collaboration_needs: string[]
}

interface PermissionDef {
  resource: string
  actions: string[]
}

interface RoleDef {
  role: string
  description: string
  permissions: PermissionDef[]
  constraints: string[]
}

interface PermissionModelOutput {
  roles: RoleDef[]
  permission_matrix: Array<{ role: string; resource: string; actions: string[] }>
  inheritance_chain: string[]
  security_notes: string[]
  diagram_description: string
  summary: string
}

// --- Tool 8: Analytics Dashboard Planner ---
interface AnalyticsDashboardInput {
  business_type: string
  key_metrics: string[]
  update_frequency: string
  audience: string[]
}

interface KPIDef {
  name: string
  formula: string
  target: string
  chart_type: string
  refresh_interval: string
}

interface AlertRule {
  metric: string
  condition: string
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  notification_channel: string
}

interface DashboardSection {
  title: string
  kpis: KPIDef[]
  layout: string
}

interface AudienceView {
  audience: string
  sections: string[]
}

interface AnalyticsDashboardOutput {
  dashboard_name: string
  sections: DashboardSection[]
  alerts: AlertRule[]
  data_sources: string[]
  refresh_strategy: string
  audience_views: AudienceView[]
  diagram_description: string
  summary: string
}

// ==================== TOOL 1: APP BLUEPRINT GENERATOR ====================

function generateAppBlueprint(input: AppBlueprintInput): AppBlueprintOutput {
  const seed = deriveSeed(input)
  const desc = input.app_description.toLowerCase()
  const platform = input.target_platform
  const features = input.core_features

  const app_name = features.length > 0
    ? features[0].charAt(0).toUpperCase() + features[0].slice(1) + ' App'
    : 'NoCode App'

  const screenTemplates: Record<string, ScreenDef> = {
    auth: { name: 'Authentication Screen', purpose: 'User login and registration', components: ['EmailInput', 'PasswordInput', 'SocialLoginButtons', 'ForgotPasswordLink'], user_actions: ['Login', 'Register', 'Reset Password'] },
    dashboard: { name: 'Dashboard', purpose: 'Main overview after login', components: ['StatsCards', 'RecentActivity', 'QuickActions', 'NavigationSidebar'], user_actions: ['View Stats', 'Navigate', 'Quick Create'] },
    list: { name: 'List View', purpose: 'Browse and search items', components: ['SearchBar', 'FilterPanel', 'DataTable', 'Pagination'], user_actions: ['Search', 'Filter', 'Sort', 'Select'] },
    detail: { name: 'Detail View', purpose: 'View single item details', components: ['HeaderSection', 'DetailFields', 'ActionButtons', 'RelatedItems'], user_actions: ['Edit', 'Delete', 'Share', 'Export'] },
    form: { name: 'Form Screen', purpose: 'Create or edit items', components: ['FormFields', 'ValidationMessages', 'SubmitButton', 'CancelButton'], user_actions: ['Fill Form', 'Submit', 'Save Draft'] },
    settings: { name: 'Settings', purpose: 'User and app configuration', components: ['SettingsTabs', 'PreferenceControls', 'DangerZone'], user_actions: ['Update Preferences', 'Delete Account'] },
    profile: { name: 'Profile', purpose: 'User profile management', components: ['AvatarUpload', 'ProfileFields', 'ActivityHistory'], user_actions: ['Edit Profile', 'Change Password'] },
    onboarding: { name: 'Onboarding', purpose: 'First-time user experience', components: ['StepIndicator', 'TutorialCards', 'SkipButton'], user_actions: ['Complete Step', 'Skip Tutorial'] }
  }

  const screens: ScreenDef[] = []
  screens.push(screenTemplates.onboarding)
  screens.push(screenTemplates.auth)
  screens.push(screenTemplates.dashboard)

  if (features.some(f => f.toLowerCase().includes('list') || f.toLowerCase().includes('browse') || f.toLowerCase().includes('search'))) {
    screens.push(screenTemplates.list)
  }
  if (features.some(f => f.toLowerCase().includes('detail') || f.toLowerCase().includes('view'))) {
    screens.push(screenTemplates.detail)
  }
  if (features.some(f => f.toLowerCase().includes('create') || f.toLowerCase().includes('edit') || f.toLowerCase().includes('form'))) {
    screens.push(screenTemplates.form)
  }
  screens.push(screenTemplates.profile)
  screens.push(screenTemplates.settings)

  const dataEntities: DataModelDef['entities'] = [
    { name: 'User', fields: ['id', 'email', 'name', 'avatar_url', 'created_at', 'role'], relationships: ['has many Items', 'has one Profile'] }
  ]
  if (features.length > 0) {
    dataEntities.push({
      name: features[0] || 'Item',
      fields: ['id', 'title', 'description', 'status', 'created_by', 'created_at', 'updated_at'],
      relationships: ['belongs to User', 'has many Tags']
    })
  }
  if (features.length > 1) {
    dataEntities.push({
      name: features[1] || 'Resource',
      fields: ['id', 'name', 'type', 'url', 'metadata'],
      relationships: ['belongs to ' + (features[0] || 'Item')]
    })
  }

  const user_flows: UserFlowDef[] = [
    { name: 'Registration Flow', steps: ['Land on onboarding', 'Complete profile setup', 'Verify email', 'Arrive at dashboard'] },
    { name: 'Core Task Flow', steps: ['Navigate to main screen', 'Search/filter items', 'Select item', 'Perform action', 'View result'] },
    { name: 'Settings Flow', steps: ['Open settings', 'Modify preferences', 'Save changes', 'Confirmation'] }
  ]

  const tech_stack: string[] = []
  if (platform.toLowerCase().includes('web') || platform.toLowerCase().includes('spa')) {
    tech_stack.push('React/Next.js for frontend')
    tech_stack.push('Tailwind CSS for styling')
  }
  if (platform.toLowerCase().includes('mobile') || platform.toLowerCase().includes('ios') || platform.toLowerCase().includes('android')) {
    tech_stack.push('React Native or Flutter for cross-platform')
  }
  tech_stack.push('Supabase or Firebase for backend-as-a-service')
  tech_stack.push('Zapier/Make for workflow automation')
  if (desc.includes('ai') || desc.includes('ml') || desc.includes('intelligent')) {
    tech_stack.push('OpenAI API or Claude API for AI features')
  }

  const build_days = rng.next(14, 45, seed)

  const architecture_diagram = 'Architecture: Client (' + platform + ') -> API Gateway -> Microservices (Auth, Data, Notifications) -> Database (PostgreSQL) -> Cache (Redis) -> External APIs'

  return {
    app_name,
    platform,
    screens,
    data_model: { entities: dataEntities },
    user_flows,
    architecture_diagram,
    tech_stack_recommendations: tech_stack,
    estimated_build_time: build_days + ' days (solo developer with no-code tools)',
    summary: 'Complete blueprint for "' + app_name + '" targeting ' + platform + ' with ' + screens.length + ' screens, ' + dataEntities.length + ' data entities, and ' + user_flows.length + ' core user flows. Built for ' + input.user_type + ' users.'
  }
}

function formatAppBlueprintReport(input: AppBlueprintInput, output: AppBlueprintOutput): string {
  const lines: string[] = []
  lines.push('## App Blueprint: ' + output.app_name)
  lines.push('')
  lines.push('**Platform:** ' + output.platform + ' | **Target Users:** ' + input.user_type)
  lines.push('**Core Features:** ' + input.core_features.join(', '))
  lines.push('')
  lines.push('### Screens (' + output.screens.length + ')')
  lines.push('| Screen | Purpose | Key Components |')
  lines.push('|--------|---------|----------------|')
  for (const s of output.screens) {
    lines.push('| ' + s.name + ' | ' + s.purpose + ' | ' + s.components.join(', ') + ' |')
  }
  lines.push('')
  lines.push('### Data Model')
  for (const e of output.data_model.entities) {
    lines.push('**' + e.name + '**')
    lines.push('- Fields: ' + e.fields.join(', '))
    lines.push('- Relationships: ' + e.relationships.join(', '))
  }
  lines.push('')
  lines.push('### User Flows')
  for (const f of output.user_flows) {
    lines.push('**' + f.name + '**')
    lines.push('- ' + f.steps.join(' -> '))
  }
  lines.push('')
  lines.push('### Architecture')
  lines.push(output.architecture_diagram)
  lines.push('')
  lines.push('### Tech Stack Recommendations')
  for (const t of output.tech_stack_recommendations) {
    lines.push('- ' + t)
  }
  lines.push('')
  lines.push('### Estimated Build Time')
  lines.push(output.estimated_build_time)
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: WORKFLOW AUTOMATOR DESIGNER ====================

function designWorkflow(input: WorkflowAutomatorInput): WorkflowAutomatorOutput {
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

  const error_handling = [
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
    error_handling,
    diagram_description,
    estimated_execution_time: exec_time + ' seconds (average)',
    optimization_tips: rng.pickN(optimization_tips, 3, seed),
    summary: 'Workflow "' + workflow_name + '" with ' + steps.length + ' steps, triggered by ' + input.trigger_type + '. Complexity: ' + complexity + '. Uses ' + integrations.length + ' integrations.'
  }
}

function formatWorkflowReport(input: WorkflowAutomatorInput, output: WorkflowAutomatorOutput): string {
  const lines: string[] = []
  lines.push('## Workflow Design: ' + output.workflow_name)
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
  for (const e of output.error_handling) {
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

// ==================== TOOL 3: DATA MODEL DESIGNER ====================

function designDataModel(input: DataModelInput): DataModelOutput {
  const seed = deriveSeed(input)
  const entities = input.core_entities
  const scale = input.scale_requirements
  const patterns = input.access_patterns

  const entityDefs: EntityDef[] = entities.map((entityName, idx) => {
    const fields: EntityField[] = [
      { name: 'id', type: 'UUID', required: true, indexed: true, description: 'Primary key' },
      { name: 'created_at', type: 'TIMESTAMP', required: true, indexed: true, description: 'Record creation time' },
      { name: 'updated_at', type: 'TIMESTAMP', required: true, indexed: false, description: 'Last update time' }
    ]

    if (idx === 0) {
      fields.push(
        { name: 'name', type: 'VARCHAR(255)', required: true, indexed: true, description: 'Display name' },
        { name: 'description', type: 'TEXT', required: false, indexed: false, description: 'Detailed description' },
        { name: 'status', type: 'ENUM', required: true, indexed: true, description: 'Current status' }
      )
    } else {
      fields.push(
        { name: entities[0].toLowerCase() + '_id', type: 'UUID (FK)', required: true, indexed: true, description: 'Reference to ' + entities[0] },
        { name: 'data', type: 'JSONB', required: false, indexed: false, description: 'Flexible data payload' }
      )
    }

    const relationships: EntityDef['relationships'] = []
    if (idx > 0) {
      relationships.push({ type: 'many-to-one', target: entities[0], field: entities[0].toLowerCase() + '_id' })
    }
    if (idx < entities.length - 1) {
      relationships.push({ type: 'one-to-many', target: entities[idx + 1], field: 'id' })
    }

    return { name: entityName, fields, relationships }
  })

  const indexes: DataModelOutput['indexes'] = entityDefs.map(e => ({
    entity: e.name,
    fields: e.fields.filter(function(f) { return f.indexed }).map(function(f) { return f.name }),
    type: 'B-tree'
  }))

  const normalization_level = scale.toLowerCase().includes('large') || scale.toLowerCase().includes('enterprise') ? '3NF (Third Normal Form)' : '2NF (Second Normal Form) - practical denormalization for read performance'

  const scaling_notes: string[] = []
  if (patterns.some(function(p) { return p.toLowerCase().includes('read') })) {
    scaling_notes.push('Add read replicas for read-heavy workloads')
    scaling_notes.push('Implement materialized views for complex queries')
  }
  if (patterns.some(function(p) { return p.toLowerCase().includes('write') })) {
    scaling_notes.push('Use write-ahead logging for write-heavy workloads')
    scaling_notes.push('Consider sharding by tenant_id for multi-tenant apps')
  }
  if (patterns.some(function(p) { return p.toLowerCase().includes('search') })) {
    scaling_notes.push('Add full-text search index (PostgreSQL tsvector or Elasticsearch)')
  }
  scaling_notes.push('Connection pooling via PgBouncer recommended for >100 concurrent users')

  const entityDescs = entityDefs.map(function(e) { return e.name + '(' + e.fields.map(function(f) { return f.name }).join(', ') + ')' }).join(' -- ')
  const diagram_description = 'ER Diagram: ' + entityDescs + '. Relationships shown with crow-notation.'

  return {
    entities: entityDefs,
    indexes,
    diagram_description,
    normalization_level,
    scaling_notes,
    summary: 'Data model with ' + entityDefs.length + ' entities, ' + entityDefs.reduce(function(sum, e) { return sum + e.fields.length }, 0) + ' total fields. Optimized for ' + patterns.join(', ') + ' access patterns at ' + scale + ' scale.'
  }
}

function formatDataModelReport(input: DataModelInput, output: DataModelOutput): string {
  const lines: string[] = []
  lines.push('## Data Model Design')
  lines.push('')
  lines.push('**App Type:** ' + input.app_type + ' | **Scale:** ' + input.scale_requirements)
  lines.push('**Access Patterns:** ' + input.access_patterns.join(', '))
  lines.push('')
  lines.push('### Entities')
  for (const e of output.entities) {
    lines.push('**' + e.name + '**')
    lines.push('| Field | Type | Required | Indexed | Description |')
    lines.push('|-------|------|----------|---------|-------------|')
    for (const f of e.fields) {
      lines.push('| ' + f.name + ' | ' + f.type + ' | ' + (f.required ? 'Yes' : 'No') + ' | ' + (f.indexed ? 'Yes' : 'No') + ' | ' + f.description + ' |')
    }
    if (e.relationships.length > 0) {
      lines.push('Relationships: ' + e.relationships.map(function(r) { return r.type + ' -> ' + r.target + ' (via ' + r.field + ')' }).join(', '))
    }
    lines.push('')
  }
  lines.push('### ER Diagram')
  lines.push(output.diagram_description)
  lines.push('')
  lines.push('### Normalization')
  lines.push(output.normalization_level)
  lines.push('')
  lines.push('### Scaling Notes')
  for (const n of output.scaling_notes) {
    lines.push('- ' + n)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: UI COMPONENT SELECTOR ====================

function selectUIComponents(input: UIComponentInput): UIComponentOutput {
  const seed = deriveSeed(input)
  const screen = input.screen_type
  const data = input.data_to_display
  const interactions = input.interaction_patterns

  const screen_name = screen.charAt(0).toUpperCase() + screen.slice(1) + ' Screen'

  const layoutOptions: LayoutRecommendation[] = [
    { pattern: 'Sidebar Layout', description: 'Fixed sidebar with main content area', responsive_behavior: 'Sidebar collapses to hamburger menu on mobile', sections: ['Sidebar', 'Header', 'Main Content', 'Footer'] },
    { pattern: 'Card Grid', description: 'Responsive grid of cards', responsive_behavior: '3 cols -> 2 cols -> 1 col as viewport shrinks', sections: ['Filter Bar', 'Card Grid', 'Pagination'] },
    { pattern: 'Single Column', description: 'Centered single column for focused tasks', responsive_behavior: 'Max-width 640px, full width on mobile', sections: ['Header', 'Content', 'Actions'] },
    { pattern: 'Split View', description: 'Master-detail split pane', responsive_behavior: 'Stacked on mobile, side-by-side on desktop', sections: ['List Panel', 'Detail Panel'] },
    { pattern: 'Dashboard Grid', description: 'Widget-based dashboard with drag-drop', responsive_behavior: 'Reflows widgets based on screen size', sections: ['KPI Row', 'Chart Grid', 'Activity Feed'] }
  ]

  const layout = layoutOptions[rng.next(0, layoutOptions.length - 1, seed)]

  const allComponents: ComponentRecommendation[] = [
    { component_type: 'DataTable', purpose: 'Display tabular data with sorting and filtering', library_suggestion: 'TanStack Table or MUI DataGrid', props: ['columns', 'data', 'onSort', 'onFilter', 'pagination'], accessibility_notes: 'Use aria-labels for sortable headers, keyboard navigation' },
    { component_type: 'FormBuilder', purpose: 'Dynamic form generation with validation', library_suggestion: 'React Hook Form + Zod', props: ['schema', 'onSubmit', 'defaultValues', 'mode'], accessibility_notes: 'Associate labels with inputs, announce validation errors via aria-live' },
    { component_type: 'Chart', purpose: 'Visualize data trends and comparisons', library_suggestion: 'Recharts or Chart.js', props: ['type', 'data', 'xKey', 'yKey', 'colors'], accessibility_notes: 'Provide data table alternative, use pattern fills not just color' },
    { component_type: 'VirtualList', purpose: 'Efficient rendering of long lists', library_suggestion: 'react-window or TanStack Virtual', props: ['items', 'itemHeight', 'renderItem', 'overscan'], accessibility_notes: 'Announce list length, support keyboard navigation' },
    { component_type: 'Modal', purpose: 'Overlay dialogs for focused interactions', library_suggestion: 'Headless UI or Radix Dialog', props: ['isOpen', 'onClose', 'title', 'children'], accessibility_notes: 'Trap focus, close on Escape, return focus on close' },
    { component_type: 'Card', purpose: 'Group related information visually', library_suggestion: 'Custom component with Tailwind', props: ['title', 'children', 'variant', 'onClick'], accessibility_notes: 'If interactive, use button role or proper heading hierarchy' },
    { component_type: 'Navigation', purpose: 'Primary app navigation', library_suggestion: 'Custom with aria-current', props: ['items', 'activePath', 'onNavigate'], accessibility_notes: 'Use nav element, indicate current page with aria-current' }
  ]

  const components: ComponentRecommendation[] = []
  if (data.some(function(d) { return d.toLowerCase().includes('list') || d.toLowerCase().includes('table') })) {
    components.push(allComponents[0])
  }
  if (data.some(function(d) { return d.toLowerCase().includes('form') || d.toLowerCase().includes('input') || d.toLowerCase().includes('edit') })) {
    components.push(allComponents[1])
  }
  if (data.some(function(d) { return d.toLowerCase().includes('chart') || d.toLowerCase().includes('graph') || d.toLowerCase().includes('metric') })) {
    components.push(allComponents[2])
  }
  if (data.some(function(d) { return d.toLowerCase().includes('card') || d.toLowerCase().includes('grid') })) {
    components.push(allComponents[3])
  }
  if (interactions.some(function(i) { return i.toLowerCase().includes('modal') || i.toLowerCase().includes('dialog') })) {
    components.push(allComponents[4])
  }
  if (interactions.some(function(i) { return i.toLowerCase().includes('navigate') || i.toLowerCase().includes('browse') })) {
    components.push(allComponents[5])
  }
  if (components.length === 0) {
    components.push(allComponents[3], allComponents[5])
  }

  const design_systems = ['Tailwind UI', 'Material Design 3', 'Ant Design', 'Chakra UI', 'shadcn/ui']
  const design_system = design_systems[rng.next(0, design_systems.length - 1, seed)]

  const interaction_flow = 'User lands on ' + screen_name + ' -> Views ' + data.join(', ') + ' -> Interacts via ' + interactions.join(', ') + ' -> Sees result/feedback'

  const accessibility_score = rng.next(72, 95, seed)

  return {
    screen_name,
    layout,
    components,
    design_system,
    interaction_flow,
    accessibility_score,
    summary: screen_name + ' with ' + layout.pattern + ' layout, ' + components.length + ' components using ' + design_system + '. Accessibility score: ' + accessibility_score + '/100.'
  }
}

function formatUIComponentReport(input: UIComponentInput, output: UIComponentOutput): string {
  const lines: string[] = []
  lines.push('## UI Component Selection: ' + output.screen_name)
  lines.push('')
  lines.push('**Screen Type:** ' + input.screen_type + ' | **User Goal:** ' + input.user_goal)
  lines.push('**Data to Display:** ' + input.data_to_display.join(', '))
  lines.push('**Interactions:** ' + input.interaction_patterns.join(', '))
  lines.push('')
  lines.push('### Layout Recommendation')
  lines.push('**Pattern:** ' + output.layout.pattern)
  lines.push('**Description:** ' + output.layout.description)
  lines.push('**Responsive:** ' + output.layout.responsive_behavior)
  lines.push('**Sections:** ' + output.layout.sections.join(' | '))
  lines.push('')
  lines.push('### Components')
  for (const c of output.components) {
    lines.push('**' + c.component_type + '** — ' + c.purpose)
    lines.push('- Library: ' + c.library_suggestion)
    lines.push('- Props: ' + c.props.join(', '))
    lines.push('- A11y: ' + c.accessibility_notes)
    lines.push('')
  }
  lines.push('### Design System')
  lines.push(output.design_system)
  lines.push('')
  lines.push('### Interaction Flow')
  lines.push(output.interaction_flow)
  lines.push('')
  lines.push('### Accessibility Score')
  lines.push(output.accessibility_score + '/100')
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: API INTEGRATION PLANNER ====================

function planAPIIntegrations(input: APIIntegrationInput): APIIntegrationOutput {
  const seed = deriveSeed(input)
  const requirements = input.app_requirements
  const apis = input.available_apis
  const auth = input.auth_method

  const integration_templates: Record<string, { auth_type: string; endpoints: Array<{ method: string; path: string; description: string }>; rate_limit: string; fallback_strategy: string }> = {
    auth: { auth_type: 'OAuth 2.0', endpoints: [{ method: 'POST', path: '/oauth/token', description: 'Exchange code for access token' }, { method: 'POST', path: '/oauth/refresh', description: 'Refresh expired token' }], rate_limit: '100/hour', fallback_strategy: 'Use cached token, queue requests during outage' },
    database: { auth_type: 'API Key', endpoints: [{ method: 'GET', path: '/records', description: 'Fetch records' }, { method: 'POST', path: '/records', description: 'Create record' }, { method: 'PUT', path: '/records/:id', description: 'Update record' }], rate_limit: '1000/hour', fallback_strategy: 'Use local cache, sync when API recovers' },
    payment: { auth_type: 'Bearer Token', endpoints: [{ method: 'POST', path: '/charges', description: 'Create charge' }, { method: 'GET', path: '/charges/:id', description: 'Get charge status' }, { method: 'POST', path: '/refunds', description: 'Issue refund' }], rate_limit: '500/hour', fallback_strategy: 'Queue transactions, process in batch' },
    notification: { auth_type: 'API Key', endpoints: [{ method: 'POST', path: '/send', description: 'Send notification' }, { method: 'GET', path: '/status/:id', description: 'Check delivery status' }], rate_limit: '200/hour', fallback_strategy: 'Retry with exponential backoff' },
    storage: { auth_type: 'HMAC Signature', endpoints: [{ method: 'PUT', path: '/upload', description: 'Upload file' }, { method: 'GET', path: '/download/:id', description: 'Download file' }], rate_limit: 'unlimited', fallback_strategy: 'Store locally, upload when connection restores' },
    analytics: { auth_type: 'API Key', endpoints: [{ method: 'POST', path: '/events', description: 'Track event' }, { method: 'GET', path: '/reports', description: 'Get analytics report' }], rate_limit: '10000/hour', fallback_strategy: 'Buffer events locally, flush periodically' }
  }

  const integrations: APIIntegration[] = []
  const usedKeys = new Set<string>()

  for (let i = 0; i < requirements.length && i < 5; i++) {
    const req = requirements[i].toLowerCase()
    let key = 'database'
    if (req.includes('auth') || req.includes('login') || req.includes('user')) key = 'auth'
    else if (req.includes('pay') || req.includes('billing') || req.includes('charge')) key = 'payment'
    else if (req.includes('email') || req.includes('notify') || req.includes('push')) key = 'notification'
    else if (req.includes('file') || req.includes('upload') || req.includes('image')) key = 'storage'
    else if (req.includes('track') || req.includes('analytics') || req.includes('metric')) key = 'analytics'

    if (usedKeys.has(key)) continue
    usedKeys.add(key)

    const template = integration_templates[key]
    integrations.push({
      name: apis[i] || (key.charAt(0).toUpperCase() + key.slice(1) + ' API'),
      purpose: requirements[i],
      auth_type: template.auth_type,
      endpoints: template.endpoints,
      rate_limit: template.rate_limit,
      fallback_strategy: template.fallback_strategy
    })
  }

  const auth_flow_description = 'Authentication Flow: User initiates login -> Redirect to ' + auth + ' provider -> Receive authorization code -> Exchange for access token -> Store token securely (httpOnly cookie) -> Attach token to API requests -> Refresh token before expiry'

  const data_flow_diagram = 'Data Flow: Client App -> API Gateway (rate limiting, auth) -> Integration Layer (transform, validate) -> External APIs -> Response Cache -> Client App'

  const error_handling_strategy = 'Implement circuit breaker (open after 5 failures, half-open after 30s). Retry with exponential backoff (1s, 2s, 4s). Log all failures. Alert on persistent issues. Degrade gracefully (show cached data, disable non-critical features).'

  const caching_recommendations = [
    'Cache GET responses for 5 minutes (configurable per endpoint)',
    'Use ETags for conditional requests to save bandwidth',
    'Implement stale-while-revalidate pattern for non-critical data',
    'Cache authentication tokens until 5 minutes before expiry'
  ]

  const security_notes = [
    'Never expose API keys in client-side code',
    'Use environment variables for all secrets',
    'Implement request signing for webhook endpoints',
    'Validate and sanitize all API responses',
    'Use HTTPS only - reject plain HTTP connections'
  ]

  if (!input.rate_limits_aware) {
    security_notes.push('WARNING: Rate limit awareness is disabled - enable to prevent service disruptions')
  }

  return {
    integrations,
    auth_flow_description,
    data_flow_diagram,
    error_handling_strategy,
    caching_recommendations,
    security_notes,
    summary: integrations.length + ' API integrations planned with ' + auth + ' authentication. ' + (input.rate_limits_aware ? 'Rate limiting enabled.' : 'Rate limiting NOT enabled.') + ' Includes caching, error handling, and security measures.'
  }
}

function formatAPIIntegrationReport(input: APIIntegrationInput, output: APIIntegrationOutput): string {
  const lines: string[] = []
  lines.push('## API Integration Plan')
  lines.push('')
  lines.push('**Requirements:** ' + input.app_requirements.join(', '))
  lines.push('**Auth Method:** ' + input.auth_method + ' | **Rate Limit Aware:** ' + (input.rate_limits_aware ? 'Yes' : 'No'))
  lines.push('')
  lines.push('### Integrations')
  for (const integ of output.integrations) {
    lines.push('**' + integ.name + '** — ' + integ.purpose)
    lines.push('- Auth: ' + integ.auth_type + ' | Rate Limit: ' + integ.rate_limit)
    lines.push('- Endpoints:')
    for (const ep of integ.endpoints) {
      lines.push('  - ' + ep.method + ' ' + ep.path + ' — ' + ep.description)
    }
    lines.push('- Fallback: ' + integ.fallback_strategy)
    lines.push('')
  }
  lines.push('### Auth Flow')
  lines.push(output.auth_flow_description)
  lines.push('')
  lines.push('### Data Flow')
  lines.push(output.data_flow_diagram)
  lines.push('')
  lines.push('### Error Handling')
  lines.push(output.error_handling_strategy)
  lines.push('')
  lines.push('### Caching Recommendations')
  for (const c of output.caching_recommendations) {
    lines.push('- ' + c)
  }
  lines.push('')
  lines.push('### Security Notes')
  for (const s of output.security_notes) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: DEPLOYMENT CONFIGURATOR ====================

function configureDeployment(input: DeploymentConfigInput): DeploymentOutput {
  const seed = deriveSeed(input)
  const users = input.expected_users
  const sensitivity = input.data_sensitivity
  const budget = input.budget_usd_month

  let hosting: string
  if (users < 1000) hosting = 'Vercel/Netlify (serverless, auto-scaling)'
  else if (users < 10000) hosting = 'Railway or Render (managed containers)'
  else if (users < 100000) hosting = 'AWS ECS Fargate or Google Cloud Run'
  else hosting = 'Kubernetes (EKS/GKE) with horizontal pod autoscaling'

  if (sensitivity === 'high' || sensitivity === 'pii' || sensitivity === 'hipaa') {
    hosting = hosting + ' + VPC isolation + encryption at rest'
  }

  const cdn_configs = [
    { provider: 'Cloudflare', strategy: 'Global edge caching with stale-while-revalidate', cache_ttl: '1 hour static, 5 min dynamic' },
    { provider: 'AWS CloudFront', strategy: 'Regional caching with origin shield', cache_ttl: '24 hours static, 1 min dynamic' },
    { provider: 'Vercel Edge', strategy: 'Automatic edge caching for static assets', cache_ttl: 'ISR with 60s revalidation' }
  ]
  const cdn_config = cdn_configs[rng.next(0, cdn_configs.length - 1, seed)]

  const env_vars: DeploymentOutput['environment_variables'] = [
    { name: 'DATABASE_URL', description: 'PostgreSQL connection string', sensitive: true },
    { name: 'JWT_SECRET', description: 'Token signing secret', sensitive: true },
    { name: 'API_KEY', description: 'External API key', sensitive: true },
    { name: 'NODE_ENV', description: 'Environment (production/staging)', sensitive: false },
    { name: 'LOG_LEVEL', description: 'Logging verbosity', sensitive: false }
  ]

  const min_instances = users < 1000 ? 1 : users < 10000 ? 2 : 3
  const max_instances = users < 1000 ? 3 : users < 10000 ? 10 : 50

  const scaling_config = {
    min_instances,
    max_instances,
    metric: 'CPU utilization',
    threshold: '70%'
  }

  const estimated_cost = Math.min(budget, Math.round(users * 0.05 + rng.next(10, 50, seed)))

  const deployment_diagram = 'Pipeline: Git Push -> CI (GitHub Actions) -> Build -> Test -> Staging Deploy -> Approval -> Production Deploy -> Health Check -> CDN Invalidation'

  const ci_cd = users > 10000 ? 'GitHub Actions with multi-stage deployment (dev -> staging -> prod)' : 'Vercel/Railway auto-deploy on git push'

  const monitoring = [
    'Uptime monitoring (Pingdom or UptimeRobot)',
    'Error tracking (Sentry)',
    'Performance monitoring (Datadog or New Relic)',
    'Log aggregation (CloudWatch or Loki)',
    'Alerting via PagerDuty or Slack'
  ]

  return {
    hosting_recommendation: hosting,
    cdn_config,
    environment_variables: env_vars,
    scaling_config,
    estimated_monthly_cost: estimated_cost,
    deployment_diagram,
    ci_cd_recommendation: ci_cd,
    monitoring_setup: monitoring,
    summary: 'Deployment for ' + users + ' expected users at $' + estimated_cost + '/mo (budget: $' + budget + '/mo). Hosting: ' + hosting + '. Scaling: ' + min_instances + '-' + max_instances + ' instances.'
  }
}

function formatDeploymentReport(input: DeploymentConfigInput, output: DeploymentOutput): string {
  const lines: string[] = []
  lines.push('## Deployment Configuration')
  lines.push('')
  lines.push('**App Type:** ' + input.app_type + ' | **Expected Users:** ' + input.expected_users)
  lines.push('**Data Sensitivity:** ' + input.data_sensitivity + ' | **Budget:** $' + input.budget_usd_month + '/mo')
  lines.push('')
  lines.push('### Hosting')
  lines.push(output.hosting_recommendation)
  lines.push('')
  lines.push('### CDN Configuration')
  lines.push('**Provider:** ' + output.cdn_config.provider)
  lines.push('**Strategy:** ' + output.cdn_config.strategy)
  lines.push('**Cache TTL:** ' + output.cdn_config.cache_ttl)
  lines.push('')
  lines.push('### Environment Variables')
  lines.push('| Variable | Description | Sensitive |')
  lines.push('|----------|-------------|-----------|')
  for (const e of output.environment_variables) {
    lines.push('| ' + e.name + ' | ' + e.description + ' | ' + (e.sensitive ? 'Yes' : 'No') + ' |')
  }
  lines.push('')
  lines.push('### Scaling Configuration')
  lines.push('Min Instances: ' + output.scaling_config.min_instances + ' | Max: ' + output.scaling_config.max_instances)
  lines.push('Metric: ' + output.scaling_config.metric + ' | Threshold: ' + output.scaling_config.threshold)
  lines.push('')
  lines.push('### Estimated Monthly Cost')
  lines.push('$' + output.estimated_monthly_cost + '/mo')
  lines.push('')
  lines.push('### CI/CD')
  lines.push(output.ci_cd_recommendation)
  lines.push('')
  lines.push('### Deployment Pipeline')
  lines.push(output.deployment_diagram)
  lines.push('')
  lines.push('### Monitoring')
  for (const m of output.monitoring_setup) {
    lines.push('- ' + m)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: PERMISSION MODEL DESIGNER ====================

function designPermissionModel(input: PermissionModelInput): PermissionModelOutput {
  const seed = deriveSeed(input)
  const roles = input.user_roles
  const sensitivity = input.data_sensitivity
  const collab = input.collaboration_needs

  const resources = ['users', 'content', 'settings', 'reports', 'billing', 'api_keys']

  const action_sets: Record<string, string[]> = {
    admin: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    editor: ['create', 'read', 'update', 'delete_own', 'publish'],
    viewer: ['read', 'export'],
    manager: ['read', 'update', 'approve', 'assign'],
    member: ['create', 'read', 'update_own', 'delete_own']
  }

  const role_defs: RoleDef[] = roles.map((role) => {
    const role_lower = role.toLowerCase()
    let actions: string[]
    if (role_lower.includes('admin')) actions = action_sets.admin
    else if (role_lower.includes('edit') || role_lower.includes('author')) actions = action_sets.editor
    else if (role_lower.includes('view') || role_lower.includes('read')) actions = action_sets.viewer
    else if (role_lower.includes('manage')) actions = action_sets.manager
    else actions = action_sets.member

    const permissions: PermissionDef[] = resources.map(function(resource) {
      return {
        resource,
        actions: resource === 'billing' && role_lower.indexOf('admin') === -1
          ? ['read']
          : resource === 'api_keys' && role_lower.indexOf('admin') === -1
            ? ['read']
            : actions
      }
    })

    const constraints: string[] = []
    if (sensitivity === 'high' || sensitivity === 'pii') {
      constraints.push('MFA required for sensitive operations')
      constraints.push('Session timeout after 15 minutes of inactivity')
    }
    if (collab.indexOf('external_collaboration') !== -1) {
      constraints.push('Cannot share data outside organization')
    }
    if (role_lower.indexOf('member') !== -1 || role_lower.indexOf('viewer') !== -1) {
      constraints.push('Rate limited to 100 API calls/hour')
    }

    return {
      role,
      description: role + ' role with ' + actions.length + ' actions across ' + resources.length + ' resources',
      permissions,
      constraints
    }
  })

  const permission_matrix: PermissionModelOutput['permission_matrix'] = []
  for (const r of role_defs) {
    for (const p of r.permissions) {
      permission_matrix.push({ role: r.role, resource: p.resource, actions: p.actions })
    }
  }

  const inheritance_chain = roles.length > 1
    ? roles.slice(1).reduce(function(chain, role, idx) { chain.push(role + ' inherits from ' + roles[idx]); return chain }, [] as string[])
    : ['No inheritance - single role model']

  const security_notes = [
    'Apply principle of least privilege - grant minimum necessary permissions',
    'Implement row-level security for multi-tenant data isolation',
    'Audit log all permission changes and sensitive data access',
    'Review and revoke unused permissions quarterly'
  ]
  if (sensitivity === 'high' || sensitivity === 'pii') {
    security_notes.push('Enable field-level encryption for PII columns')
    security_notes.push('Implement data retention policies with automatic purging')
  }

  const diagram_description = 'Permission Hierarchy: ' + roles.join(' > ') + '. Each role has specific CRUD permissions on resources: ' + resources.join(', ') + '. Constraints applied based on data sensitivity level: ' + sensitivity + '.'

  return {
    roles: role_defs,
    permission_matrix,
    inheritance_chain,
    security_notes,
    diagram_description,
    summary: roles.length + ' roles defined with ' + permission_matrix.length + ' permission rules. Data sensitivity: ' + sensitivity + '. Collaboration features: ' + collab.join(', ') + '.'
  }
}

function formatPermissionModelReport(input: PermissionModelInput, output: PermissionModelOutput): string {
  const lines: string[] = []
  lines.push('## Permission Model Design')
  lines.push('')
  lines.push('**App Type:** ' + input.app_type + ' | **Data Sensitivity:** ' + input.data_sensitivity)
  lines.push('**Roles:** ' + input.user_roles.join(', '))
  lines.push('**Collaboration Needs:** ' + input.collaboration_needs.join(', '))
  lines.push('')
  lines.push('### Roles and Permissions')
  for (const r of output.roles) {
    lines.push('**' + r.role + '** — ' + r.description)
    lines.push('| Resource | Actions |')
    lines.push('|----------|---------|')
    for (const p of r.permissions) {
      lines.push('| ' + p.resource + ' | ' + p.actions.join(', ') + ' |')
    }
    if (r.constraints.length > 0) {
      lines.push('Constraints: ' + r.constraints.join('; '))
    }
    lines.push('')
  }
  lines.push('### Inheritance Chain')
  for (const i of output.inheritance_chain) {
    lines.push('- ' + i)
  }
  lines.push('')
  lines.push('### Permission Diagram')
  lines.push(output.diagram_description)
  lines.push('')
  lines.push('### Security Notes')
  for (const s of output.security_notes) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: ANALYTICS DASHBOARD PLANNER ====================

function planAnalyticsDashboard(input: AnalyticsDashboardInput): AnalyticsDashboardOutput {
  const seed = deriveSeed(input)
  const business = input.business_type
  const metrics = input.key_metrics
  const frequency = input.update_frequency
  const audience = input.audience

  const dashboard_name = business.charAt(0).toUpperCase() + business.slice(1) + ' Analytics Dashboard'

  const kpi_templates: Record<string, { formula: string; target: string; chart_type: string; refresh_interval: string }> = {
    revenue: { formula: 'SUM(transaction_amount) WHERE status = completed', target: 'MoM growth > 10%', chart_type: 'Line Chart', refresh_interval: '1 hour' },
    users: { formula: 'COUNT(DISTINCT user_id) WHERE created_at >= period_start', target: '10% weekly growth', chart_type: 'Area Chart', refresh_interval: '15 minutes' },
    conversion: { formula: 'COUNT(conversions) / COUNT(visits) * 100', target: '> 3%', chart_type: 'Funnel Chart', refresh_interval: '1 hour' },
    retention: { formula: 'COUNT(active_users_day7) / COUNT(new_users_week1) * 100', target: '> 40%', chart_type: 'Cohort Table', refresh_interval: '24 hours' },
    engagement: { formula: 'SUM(session_duration) / COUNT(sessions)', target: '> 5 minutes', chart_type: 'Bar Chart', refresh_interval: '30 minutes' },
    performance: { formula: 'AVG(response_time_ms)', target: '< 200ms p95', chart_type: 'Sparkline', refresh_interval: '5 minutes' },
    satisfaction: { formula: 'AVG(rating) FROM feedback', target: '> 4.5/5', chart_type: 'Gauge Chart', refresh_interval: '24 hours' },
    churn: { formula: 'COUNT(cancelled) / COUNT(total) * 100', target: '< 5% monthly', chart_type: 'Line Chart', refresh_interval: '24 hours' }
  }

  const kpiKeys = Object.keys(kpi_templates)
  const overviewKpis: KPIDef[] = metrics.slice(0, 3).map(function(m, i) {
    const key = kpiKeys[i % kpiKeys.length]
    const template = kpi_templates[key]
    return { name: m, formula: template.formula, target: template.target, chart_type: template.chart_type, refresh_interval: template.refresh_interval }
  })

  const trendKpis: KPIDef[] = metrics.slice(3).map(function(m, i) {
    const key = kpiKeys[(i + 3) % kpiKeys.length]
    const template = kpi_templates[key]
    return { name: m, formula: template.formula, target: template.target, chart_type: template.chart_type, refresh_interval: template.refresh_interval }
  })

  const sections: DashboardSection[] = [
    {
      title: 'Overview',
      kpis: overviewKpis,
      layout: '3-column KPI cards with sparklines'
    },
    {
      title: 'Trends',
      kpis: trendKpis,
      layout: '2-column chart grid with time range selector'
    }
  ]

  const alert_templates: Array<{ condition: string; threshold: number; severity: AlertRule['severity']; notification_channel: string }> = [
    { condition: 'drops below', threshold: rng.next(50, 80, seed), severity: 'warning', notification_channel: 'Slack #alerts' },
    { condition: 'exceeds', threshold: rng.next(90, 150, seed), severity: 'critical', notification_channel: 'PagerDuty' },
    { condition: 'anomaly detected', threshold: rng.next(2, 4, seed), severity: 'info', notification_channel: 'Email digest' }
  ]

  const alerts: AlertRule[] = metrics.slice(0, 4).map(function(m, i) {
    return {
      metric: m,
      condition: alert_templates[i % alert_templates.length].condition,
      threshold: alert_templates[i % alert_templates.length].threshold,
      severity: alert_templates[i % alert_templates.length].severity,
      notification_channel: alert_templates[i % alert_templates.length].notification_channel
    }
  })

  const data_sources = [
    'Application Database (PostgreSQL)',
    'Event Tracking (Segment or custom)',
    'Error Tracking (Sentry)',
    'Payment Processor (Stripe)',
    'User Analytics (Mixpanel or PostHog)'
  ]

  const refresh_strategy = frequency === 'realtime' ? 'WebSocket push for critical metrics, 30s polling for others' : frequency === 'hourly' ? 'Scheduled refresh every hour with on-demand refresh button' : 'Daily batch refresh at 00:00 UTC with manual refresh option'

  const audience_views: AudienceView[] = audience.map(function(a) {
    return {
      audience: a,
      sections: a.toLowerCase().indexOf('exec') !== -1 || a.toLowerCase().indexOf('c-level') !== -1
        ? ['Overview']
        : ['Overview', 'Trends']
    }
  })

  const diagram_description = 'Dashboard Layout: [Header with date range] -> [Overview KPI Row] -> [Trend Charts Grid] -> [Alert Panel] -> [Drill-down Modal]. Data flows from ' + data_sources.slice(0, 3).join(', ') + ' through ETL to analytics database.'

  return {
    dashboard_name,
    sections,
    alerts,
    data_sources,
    refresh_strategy,
    audience_views,
    diagram_description,
    summary: dashboard_name + ' with ' + sections.length + ' sections, ' + alerts.length + ' alert rules, and ' + audience.length + ' audience views. Update frequency: ' + frequency + '.'
  }
}

function formatAnalyticsDashboardReport(input: AnalyticsDashboardInput, output: AnalyticsDashboardOutput): string {
  const lines: string[] = []
  lines.push('## Analytics Dashboard Plan: ' + output.dashboard_name)
  lines.push('')
  lines.push('**Business Type:** ' + input.business_type + ' | **Update Frequency:** ' + input.update_frequency)
  lines.push('**Key Metrics:** ' + input.key_metrics.join(', '))
  lines.push('**Audience:** ' + input.audience.join(', '))
  lines.push('')
  lines.push('### Dashboard Sections')
  for (const s of output.sections) {
    lines.push('**' + s.title + '** — ' + s.layout)
    lines.push('| KPI | Formula | Target | Chart | Refresh |')
    lines.push('|-----|---------|--------|-------|---------|')
    for (const k of s.kpis) {
      lines.push('| ' + k.name + ' | ' + k.formula + ' | ' + k.target + ' | ' + k.chart_type + ' | ' + k.refresh_interval + ' |')
    }
    lines.push('')
  }
  lines.push('### Alert Rules')
  lines.push('| Metric | Condition | Threshold | Severity | Channel |')
  lines.push('|--------|-----------|-----------|----------|---------|')
  for (const a of output.alerts) {
    lines.push('| ' + a.metric + ' | ' + a.condition + ' | ' + a.threshold + ' | ' + a.severity + ' | ' + a.notification_channel + ' |')
  }
  lines.push('')
  lines.push('### Data Sources')
  for (const d of output.data_sources) {
    lines.push('- ' + d)
  }
  lines.push('')
  lines.push('### Refresh Strategy')
  lines.push(output.refresh_strategy)
  lines.push('')
  lines.push('### Audience Views')
  for (const v of output.audience_views) {
    lines.push('- ' + v.audience + ': ' + v.sections.join(', '))
  }
  lines.push('')
  lines.push('### Dashboard Layout')
  lines.push(output.diagram_description)
  lines.push('')
  lines.push('---')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: App Blueprint Generator
  tools.register(defineTool({
    name: 'app_blueprint_generator',
    description: 'Generates a complete app blueprint (screens, data model, user flows) from a natural language description. Transforms an idea into a structured build plan with screen definitions, data entities, user flows, architecture diagram, and tech stack recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_description (string), target_platform (string), user_type (string), core_features (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: AppBlueprintInput = JSON.parse(args.input_data)
      const result = generateAppBlueprint(input)
      return formatAppBlueprintReport(input, result)
    }
  }))

  // Tool 2: Workflow Automator Designer
  tools.register(defineTool({
    name: 'workflow_automator_designer',
    description: 'Designs automated workflows (trigger, actions, conditions) for business processes. Generates step-by-step workflow definitions with integrations, error handling, execution flow diagrams, and optimization tips.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: process_description (string), trigger_type (string), available_integrations (string[]), complexity_level (string)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: WorkflowAutomatorInput = JSON.parse(args.input_data)
      const result = designWorkflow(input)
      return formatWorkflowReport(input, result)
    }
  }))

  // Tool 3: Data Model Designer
  tools.register(defineTool({
    name: 'data_model_designer',
    description: 'Designs database schema (entities, relationships, fields) for a no-code app. Produces entity definitions with typed fields, indexes, ER diagrams, normalization guidance, and scaling recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_type (string), core_entities (string[]), scale_requirements (string), access_patterns (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: DataModelInput = JSON.parse(args.input_data)
      const result = designDataModel(input)
      return formatDataModelReport(input, result)
    }
  }))

  // Tool 4: UI Component Selector
  tools.register(defineTool({
    name: 'ui_component_selector',
    description: 'Recommends optimal UI components and layout for a given screen/purpose. Suggests component types, libraries, props, layout patterns, design systems, and accessibility considerations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: screen_type (string), user_goal (string), data_to_display (string[]), interaction_patterns (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: UIComponentInput = JSON.parse(args.input_data)
      const result = selectUIComponents(input)
      return formatUIComponentReport(input, result)
    }
  }))

  // Tool 5: API Integration Planner
  tools.register(defineTool({
    name: 'api_integration_planner',
    description: 'Plans API integrations needed for an app (auth, data sources, webhooks). Defines integration endpoints, auth flows, data flow diagrams, error handling strategies, caching, and security notes.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_requirements (string[]), available_apis (string[]), auth_method (string), rate_limits_aware (boolean)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: APIIntegrationInput = JSON.parse(args.input_data)
      const result = planAPIIntegrations(input)
      return formatAPIIntegrationReport(input, result)
    }
  }))

  // Tool 6: Deployment Configurator
  tools.register(defineTool({
    name: 'deployment_configurator',
    description: 'Generates deployment configuration for no-code apps (hosting, CDN, env vars, scaling). Provides hosting recommendations, CDN setup, environment variables, scaling rules, CI/CD pipeline, and monitoring stack.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_type (string), expected_users (number), data_sensitivity (string), budget_usd_month (number)' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: DeploymentConfigInput = JSON.parse(args.input_data)
      const result = configureDeployment(input)
      return formatDeploymentReport(input, result)
    }
  }))

  // Tool 7: Permission Model Designer
  tools.register(defineTool({
    name: 'permission_model_designer',
    description: 'Designs user roles and permission matrix for multi-user no-code apps. Creates role definitions, permission rules per resource, inheritance chains, security constraints, and access control diagrams.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: app_type (string), user_roles (string[]), data_sensitivity (string), collaboration_needs (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: PermissionModelInput = JSON.parse(args.input_data)
      const result = designPermissionModel(input)
      return formatPermissionModelReport(input, result)
    }
  }))

  // Tool 8: Analytics Dashboard Planner
  tools.register(defineTool({
    name: 'analytics_dashboard_planner',
    description: 'Plans analytics dashboards with KPIs, charts, and alert rules. Defines dashboard sections, KPI formulas, chart types, alert thresholds, data sources, refresh strategies, and audience-specific views.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: business_type (string), key_metrics (string[]), update_frequency (string), audience (string[])' }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { input_data: string }) {
      const input: AnalyticsDashboardInput = JSON.parse(args.input_data)
      const result = planAnalyticsDashboard(input)
      return formatAnalyticsDashboardReport(input, result)
    }
  }))

  console.log('[dsh-tool-nocodeengine] Loaded v' + VERSION + ' - No-Code/Low-Code Engine with 8 tools')
  console.log('  Tools: app_blueprint_generator, workflow_automator_designer, data_model_designer, ui_component_selector, api_integration_planner, deployment_configurator, permission_model_designer, analytics_dashboard_planner')
}
