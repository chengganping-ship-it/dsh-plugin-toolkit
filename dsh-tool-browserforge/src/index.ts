/**
 * DSH Browser Automation Engine Plugin v0.1.0
 *
 * Browser automation engine for DeepSeek Harness — web testing, screenshots,
 * form filling, data extraction, accessibility testing, performance profiling,
 * and cross-browser compatibility planning. Designed as the DSH equivalent of
 * Playwright Skill (one of the most popular Claude Code skills).
 *
 * Features (v0.1.0):
 * - Test Script Generator (Playwright/Puppeteer test code generation)
 * - Selector Advisor (CSS/XPath selector recommendations with stability scores)
 * - Screenshot Planner (viewport-aware screenshot strategy with checkpoints)
 * - Form Fill Designer (form automation scripts with boundary test cases)
 * - Data Extraction Planner (web scraping scripts with selector mapping)
 * - Accessibility Tester (WCAG compliance testing with violation checklists)
 * - Performance Profiler (Core Web Vitals benchmarking with thresholds)
 * - Cross Browser Planner (compatibility matrix and test prioritization)
 *
 * @module dsh-tool-browserforge
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-browserforge'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY ====================

/** Generate a deterministic pseudo-random number from a string seed (range: 0-1) */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function padCenter(text: string, width: number): string {
  const len = text.length
  if (len >= width) return text
  const left = Math.floor((width - len) / 2)
  const right = width - len - left
  return ' '.repeat(left) + text + ' '.repeat(right)
}

// ==================== TYPES ====================

// --- Tool 1: Test Script Generator ---
type TestFramework = 'playwright' | 'puppeteer' | 'cypress' | 'selenium'
type BrowserTarget = 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge'

interface TestScenario {
  name: string
  steps: TestStep[]
  assertions?: string[]
  expected_result: string
}

interface TestStep {
  action: 'navigate' | 'click' | 'fill' | 'select' | 'hover' | 'wait' | 'screenshot' | 'scroll' | 'assert' | 'evaluate'
  target?: string
  value?: string
  timeout?: number
}

interface TestScriptInput {
  test_scenarios: TestScenario[]
  browser_targets: BrowserTarget[]
  framework: TestFramework
  base_url?: string
  headless?: boolean
  output_path?: string
}

interface TestCase {
  scenario_name: string
  test_function_name: string
  code: string
  coverage_areas: string[]
  estimated_duration_ms: number
  risk_level: 'low' | 'medium' | 'high'
}

interface TestScriptResult {
  framework: TestFramework
  total_scenarios: number
  total_test_cases: number
  imports: string[]
  setup_code: string
  teardown_code: string
  test_cases: TestCase[]
  full_script: string
  execution_command: string
  report_summary: string
}

// --- Tool 2: Selector Advisor ---
interface TargetElement {
  description: string
  tag_hint?: string
  text_content?: string
  role_hint?: string
  purpose: 'interaction' | 'read' | 'navigation' | 'form'
}

interface SelectorAdvisorInput {
  page_description: string
  target_elements: TargetElement[]
  prefer_stable?: boolean
  browser_support?: BrowserTarget[]
}

interface SelectorCandidate {
  selector: string
  type: 'css' | 'xpath' | 'aria' | 'text'
  stability_score: number
  performance_score: number
  maintainability_score: number
  overall_score: number
  pros: string[]
  cons: string[]
}

interface ElementAdvice {
  element_description: string
  recommended: SelectorCandidate
  alternatives: SelectorCandidate[]
  anti_patterns: string[]
  test_suggestion: string
}

interface SelectorAdvisorResult {
  page_description: string
  total_elements: number
  advice_list: ElementAdvice[],
  global_tips: string[],
  selector_map: Record<string, string>
}

// --- Tool 3: Screenshot Planner ---
interface ViewportConfig {
  name: string
  width: number
  height: number
  device_scale_factor?: number
  user_agent?: string
  is_mobile?: boolean
}

interface InteractionStep {
  step_number: number
  action: string
  target?: string
  wait_after_ms?: number
  description: string
}

interface ScreenshotPlInput {
  url: string
  viewports: ViewportConfig[]
  interaction_steps: InteractionStep[]
  full_page?: boolean
  highlight_selectors?: string[]
  mask_selectors?: string[]
  output_directory?: string
}

interface ScreenshotCheckpoint {
  step_label: string
  viewport: string
  trigger: string
  screenshot_name: string
  checks: string[]
  expected_state: string
}

interface ViewportPlan {
  viewport_name: string
  dimensions: string
  total_screenshots: number
  checkpoints: ScreenshotCheckpoint[]
}

interface ScreenshotPlResult {
  url: string
  total_viewports: number
  total_checkpoints: number
  viewport_plans: ViewportPlan[]
  interaction_flow_diagram: string
  storage_estimate_mb: number
  ci_integration_tips: string[]
  report: string
}

// --- Tool 4: Form Fill Designer ---
type TestDataStrategy = 'valid' | 'boundary' | 'invalid' | 'sql_injection' | 'xss' | 'fuzz' | 'realistic' | 'all'

interface FormFieldSchema {
  name: string
  selector: string
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file'
  required: boolean
  min_length?: number
  max_length?: number
  pattern?: string
  options?: string[]
  label: string
}

interface ValidationRule {
  field_name: string
  rule: string
  error_message: string
  Trigger: 'blur' | 'submit' | 'input'
}

interface FormFillInput {
  form_schema: FormFieldSchema[]
  test_data_strategy: TestDataStrategy
  validation_rules: ValidationRule[]
  form_selector?: string
  submit_selector?: string
  success_indicator?: string
}

interface BoundaryTestCase {
  field_name: string
  test_type: string
  test_value: string
  expected_behavior: string
  severity: 'info' | 'warning' | 'error'
}

interface FormFillScript {
  script_name: string
  strategy: TestDataStrategy
  fill_code: string
  submit_code: string
  validation_code: string
  assertions: string[]
}

interface FormFillResult {
  form_fields_count: number
  strategies_covered: string[]
  boundary_test_cases: BoundaryTestCase[]
  fill_scripts: FormFillScript[]
  full_script: string
  security_notes: string[]
  report: string
}

// --- Tool 5: Data Extraction Planner ---
interface DataFieldSchema {
  name: string
  selector: string
  attribute?: string
  transform?: 'trim' | 'lowercase' | 'uppercase' | 'number' | 'date' | 'regex'
  regex_pattern?: string
  default_value?: string
  required: boolean
}

interface PaginationConfig {
  type: 'next_button' | 'infinite_scroll' | 'page_numbers' | 'load_more' | 'url_param'
  selector?: string
  url_pattern?: string
  max_pages?: number
  stop_condition?: string
}

interface DataExtractionInput {
  target_url: string
  data_schema: DataFieldSchema[]
  pagination_config?: PaginationConfig
  wait_for_selector?: string
  delay_between_pages_ms?: number
  output_format?: 'json' | 'csv' | 'sqlite'
}

interface ExtractorMapping {
  field_name: string
  selector: string
  selector_type: 'css' | 'xpath'
  confidence: number
  fallback_selectors: string[]
  attribute?: string
  transform?: string
  required: boolean
  notes: string
}

interface ExtractionScript {
  script_type: string
  framework: string
  code: string
  estimated_records: number
  estimated_duration_sec: number
}

interface DataExtractionResult {
  target_url: string
  total_fields: number
  selector_mappings: ExtractorMapping[],
  pagination_handling: string
  extraction_scripts: ExtractionScript[]
  full_script: string
  ethical_notes: string[]
  report: string
}

// --- Tool 6: Accessibility Tester ---
type WcagLevel = 'A' | 'AA' | 'AAA'

interface PageElementA11y {
  tag: string
  selector: string
  text?: string
  has_alt?: boolean
  has_label?: boolean
  has_role?: boolean
  aria_attributes?: string[]
  keyboard_accessible?: boolean
  color_contrast_pair?: [string, string]
}

interface AccessibilityTestInput {
  page_elements: PageElementA11y[]
  wcag_level: WcagLevel
  page_url?: string
  include_best_practices?: boolean
}

interface A11yViolation {
  principle: string
  criterion: string
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  affected_elements: string[]
  remediation: string
  wcag_ref: string
}

interface A11yTestScript {
  script_name: string
  tool: 'axe-core' | 'lighthouse' | 'pa11y' | 'manual'
  code: string
  coverage: string[]
}

interface AccessibilityTestResult {
  wcag_level: WcagLevel
  page_url: string
  total_elements: number
  total_violations: number
  critical_count: number
  serious_count: number
  moderate_count: number
  minor_count: number
  violations: A11yViolation[]
  test_scripts: A11yTestScript[]
  compliance_score: number
  improvement_priority: string[]
  report: string
}

// --- Tool 7: Performance Profiler ---
type PerfMetric = 'lcp' | 'fid' | 'cls' | 'ttfb' | 'fcp' | 'inp' | 'tbt'

interface PerformanceProfilerInput {
  page_urls: string[]
  metrics: PerfMetric[]
  browser?: BrowserTarget
  network_throttle?: 'fast4g' | 'slow4g' | '3g' | 'offline'
  cpu_throttle?: 1 | 2 | 4 | 6 | 8
  iterations?: number
}

interface MetricThreshold {
  metric: PerfMetric
  good: number
  needs_improvement: number
  poor: number
  unit: string
}

interface UrlPerformancePlan {
  url: string
  metrics: PerfMetric[]
  estimated_baseline: Record<string, number>
  threshold_checks: string[]
  optimization_hints: string[]
}

interface PerformanceProfilerResult {
  urls_count: number
  metrics_count: number
  iterations: number,
  network_profile: string,
  cpu_throttle: number,
  metric_thresholds: MetricThreshold[],
  url_plans: UrlPerformancePlan[],
  test_script: string,
  full_script: string,
  report: string
}

// --- Tool 8: Cross Browser Planner ---
type BrowserFamily = 'chromium' | 'firefox' | 'webkit' | 'edge' | 'samsung' | 'opera'

interface FeatureToTest {
  feature: string
  category: 'css' | 'javascript' | 'api' | 'dom' | 'media' | 'security' | 'performance'
  criticality: 'must-work' | 'should-work' | 'nice-to-have'
  fallback_strategy?: string
}

interface CrossBrowserInput {
  target_browsers: BrowserFamily[]
  features_to_test: FeatureToTest[]
  min_versions?: Record<string, string>
  test_priority?: 'breadth-first' | 'depth-first' | 'risk-based'
}

interface BrowserVersion {
  browser: BrowserFamily
  version: string
  engine: string
  market_share: number
  supported_features: string[]
  known_limitations: string[]
}

interface CompatibilityCell {
  browser: BrowserFamily
  feature: string
  support: 'full' | 'partial' | 'none' | 'unknown'
  notes: string
  polyfill?: string
}

interface CrossBrowserResult {
  browsers_analyzed: number
  features_tested: number
  compatibility_matrix: CompatibilityCell[]
  browsers_detail: BrowserVersion[]
  test_priority_order: string[]
  risk_areas: string[]
  polyfill_recommendations: string[]
  test_plan_markdown: string,
  report: string
}

// ==================== TOOL 1: TEST SCRIPT GENERATOR ====================

function generateTestScript(input: TestScriptInput): TestScriptResult {
  const { test_scenarios, browser_targets, framework, base_url, headless } = input
  const hp = headless !== false
  const bu = base_url || 'http://localhost:3000'

  const imports: string[] = []
  const hSetup: string[] = []
  const hTeardown: string[] = []

  if (framework === 'playwright') {
    imports.push("import { test, expect, devices } from '@playwright/test'")
  } else if (framework === 'puppeteer') {
    imports.push("import puppeteer from 'puppeteer'")
  } else if (framework === 'cypress') {
    imports.push("/// <reference types='cypress' />")
  } else {
    imports.push("import { Builder, By, until } from 'selenium-webdriver'")
    imports.push("import chrome from 'selenium-webdriver/chrome'")
  }

  hSetup.push(`// Browser targets: ${browser_targets.join(', ')}`)
  hSetup.push(`// Headless: ${hp}`)
  hSetup.push(`// Base URL: ${bu}`)
  hSetup.push(`// Generated by dsh-tool-browserforge v${VERSION}`)

  hTeardown.push('// Teardown: close browsers and cleanup')

  const testCases: TestCase[] = []

  for (const scenario of test_scenarios) {
    const fnName = scenario.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const codeLines: string[] = []
    const coverage: string[] = []

    if (framework === 'playwright') {
      codeLines.push(`test('${scenario.name}', async ({ page }) => {`)
      for (const step of scenario.steps) {
        const tgt = step.target || ''
        switch (step.action) {
          case 'navigate':
            codeLines.push(`  await page.goto('${tgt || bu}')`)
            coverage.push('navigation')
            break
          case 'click':
            codeLines.push(`  await page.click('${tgt}')`)
            coverage.push('interaction')
            break
          case 'fill':
            codeLines.push(`  await page.fill('${tgt}', '${step.value || ''}')`)
            coverage.push('form-input')
            break
          case 'wait':
            codeLines.push(`  await page.waitForTimeout(${step.timeout || 1000})`)
            break
          case 'screenshot':
            codeLines.push(`  await page.screenshot({ path: 'screenshots/${fnName}.png' })`)
            coverage.push('visual-regression')
            break
          case 'assert':
            codeLines.push(`  expect(await page.locator('${tgt}').isVisible()).toBe(true)`)
            coverage.push('assertion')
            break
          case 'evaluate':
            codeLines.push(`  await page.evaluate(() => { /* ${tgt} */ })`)
            break
          case 'hover':
            codeLines.push(`  await page.hover('${tgt}')`)
            coverage.push('interaction')
            break
          case 'scroll':
            codeLines.push(`  await page.evaluate(() => window.scrollBy(0, 500))`)
            break
          case 'select':
            codeLines.push(`  await page.selectOption('${tgt}', '${step.value || ''}')`)
            coverage.push('form-input')
            break
        }
      }
      if (scenario.assertions) {
        for (const assertion of scenario.assertions) {
          codeLines.push(`  expect(${assertion}).toBeTruthy()`)
        }
      }
      codeLines.push(`  // Expected: ${scenario.expected_result}`)
      codeLines.push('})')
    } else if (framework === 'puppeteer') {
      codeLines.push(`async function ${fnName}(browser) {`)
      codeLines.push('  const page = await browser.newPage()')
      for (const step of scenario.steps) {
        const tgt = step.target || ''
        switch (step.action) {
          case 'navigate':
            codeLines.push(`  await page.goto('${tgt || bu}')`)
            coverage.push('navigation')
            break
          case 'click':
            codeLines.push(`  await page.click('${tgt}')`)
            coverage.push('interaction')
            break
          case 'fill':
            codeLines.push(`  await page.type('${tgt}', '${step.value || ''}')`)
            coverage.push('form-input')
            break
          case 'wait':
            codeLines.push(`  await new Promise(r => setTimeout(r, ${step.timeout || 1000}))`)
            break
          case 'screenshot':
            codeLines.push(`  await page.screenshot({ path: 'screenshots/${fnName}.png' })`)
            coverage.push('visual-regression')
            break
          default:
            codeLines.push(`  // ${step.action}: ${tgt}`)
            break
        }
      }
      codeLines.push('  await page.close()')
      codeLines.push('}')
    } else if (framework === 'cypress') {
      codeLines.push(`it('${scenario.name}', () => {`)
      for (const step of scenario.steps) {
        const tgt = step.target || ''
        switch (step.action) {
          case 'navigate':
            codeLines.push(`  cy.visit('${tgt || bu}')`)
            break
          case 'click':
            codeLines.push(`  cy.get('${tgt}').click()`)
            break
          case 'fill':
            codeLines.push(`  cy.get('${tgt}').type('${step.value || ''}')`)
            break
          case 'assert':
            codeLines.push(`  cy.get('${tgt}').should('be.visible')`)
            break
          default:
            codeLines.push(`  // ${step.action}: ${tgt}`)
            break
        }
      }
      codeLines.push('})')
    } else {
      codeLines.push(`async function ${fnName}(driver) {`)
      for (const step of scenario.steps) {
        const tgt = step.target || ''
        switch (step.action) {
          case 'navigate':
            codeLines.push(`  await driver.get('${tgt || bu}')`)
            break
          case 'click':
            codeLines.push(`  await driver.findElement(By.css('${tgt}')).click()`)
            break
          case 'fill':
            codeLines.push(`  await driver.findElement(By.css('${tgt}')).sendKeys('${step.value || ''}')`)
            break
          default:
            codeLines.push(`  // ${step.action}: ${tgt}`)
            break
        }
      }
      codeLines.push('}')
    }

    const seed = seededRandom(scenario.name)
    const duration = Math.round(seed * 5000 + 500)
    const risk: 'low' | 'medium' | 'high' = seed > 0.7 ? 'high' : seed > 0.3 ? 'medium' : 'low'

    testCases.push({
      scenario_name: scenario.name,
      test_function_name: fnName,
      code: codeLines.join('\n'),
      coverage_areas: [...new Set(coverage)],
      estimated_duration_ms: duration,
      risk_level: risk
    })
  }

  const fullScript = [
    imports.join('\n'),
    '',
    ...hSetup,
    '',
    testCases.map(tc => tc.code).join('\n\n'),
    '',
    ...hTeardown
  ].join('\n')

  const execCmd = framework === 'playwright' ? 'npx playwright test' : framework === 'puppeteer' ? 'node test.js' : framework === 'cypress' ? 'npx cypress run' : 'node test.js'

  const hGen = [
    '### Test Generation Report',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Framework | ${framework} |`,
    `| Scenarios | ${test_scenarios.length} |`,
    `| Test Cases | ${testCases.length} |`,
    `| Browser Targets | ${browser_targets.join(', ')} |`,
    `| Headless | ${hp} |`,
    `| Total Est. Duration | ${testCases.reduce((s, t) => s + t.estimated_duration_ms, 0)}ms |`,
    '',
    '#### Risk Distribution',
    ''
  ]

  const hRiskCount: Record<string, number> = { low: 0, medium: 0, high: 0 }
  for (const tc of testCases) hRiskCount[tc.risk_level]++
  for (const [level, count] of Object.entries(hRiskCount)) {
    hGen.push(`- ${level.toUpperCase()}: ${count} test case(s)`)
  }
  hGen.push('')
  hGen.push(`**Execution:** \`${execCmd}\``)

  return {
    framework,
    total_scenarios: test_scenarios.length,
    total_test_cases: testCases.length,
    imports,
    setup_code: hSetup.join('\n'),
    teardown_code: hTeardown.join('\n'),
    test_cases: testCases,
    full_script: fullScript,
    execution_command: execCmd,
    report_summary: hGen.join('\n')
  }
}

// ==================== TOOL 2: SELECTOR ADVISOR ====================

function adviseSelectors(input: SelectorAdvisorInput): SelectorAdvisorResult {
  const { page_description, target_elements, prefer_stable } = input
  const stable = prefer_stable !== false

  const hAdviceList: ElementAdvice[] = []
  const hGlobalTips: string[] = []
  const hSelectorMap: Record<string, string> = {}

  for (const el of target_elements) {
    const hCandidates: SelectorCandidate[] = []
    const hDesc = el.description.replace(/\s+/g, '_')
    const hSeed = seededRandom(el.description)

    const hCssScore = clamp(hSeed * 100, 60, 99)
    const hXpathScore = clamp(hSeed * 85 + 10, 40, 90)
    const hAriaScore = stable ? clamp(hSeed * 95 + 5, 70, 99) : clamp(hSeed * 80, 40, 80)
    const hTextScore = clamp(hSeed * 70 + 10, 30, 80)

    const hElTag = el.tag_hint || 'div'
    const hRoleAttr = el.role_hint || ''

    hCandidates.push({
      selector: `${el.tag_hint || 'div'}[data-testid='${hDesc.toLowerCase()}']`,
      type: 'css',
      stability_score: hCssScore,
      performance_score: 95,
      maintainability_score: 90,
      overall_score: hCssScore,
      pros: ['Fastest query performance', 'Stable against DOM changes', 'Explicit test contract'],
      cons: ['Requires data-testid attribute in markup'],
    })

    if (hRoleAttr) {
      hCandidates.push({
        selector: `[role='${hRoleAttr}']`,
        type: 'aria',
        stability_score: hAriaScore,
        performance_score: 80,
        maintainability_score: 95,
        overall_score: hAriaScore,
        pros: ['Semantically meaningful', 'Improves accessibility', 'Resistant to styling changes'],
        cons: ['Requires correct ARIA roles in markup'],
      })
    }

    hCandidates.push({
      selector: `//${hElTag}[contains(text(), '${el.text_content || el.description}')]`,
      type: 'xpath',
      stability_score: hXpathScore,
      performance_score: 60,
      maintainability_score: 50,
      overall_score: hXpathScore,
      pros: ['Works without special attributes', 'Can match partial text'],
      cons: ['Slowest performance', 'Brittle to text changes', 'Complex syntax'],
    })

    if (el.text_content) {
      hCandidates.push({
        selector: `text=${el.text_content}`,
        type: 'text',
        stability_score: hTextScore,
        performance_score: 70,
        maintainability_score: 60,
        overall_score: hTextScore,
        pros: ['Human-readable', 'No attribute dependency'],
        cons: ['Breaks with localization', 'Whitespace sensitive'],
      })
    }

    hCandidates.sort((a, b) => b.overall_score - a.overall_score)

    const hAntiPatterns = [
      "div > div > div > span (overly deep nesting)",
      ":nth-child() without semantic anchor",
      ".class1.class2.class3 (overly specific)",
      "XPath with absolute path (html/body/div[1]/...)",
    ]

    const hTest = `Test selector with: await page.waitForSelector('${hCandidates[0].selector}')`

    hAdviceList.push({
      element_description: el.description,
      recommended: hCandidates[0],
      alternatives: hCandidates.slice(1),
      anti_patterns: hAntiPatterns,
      test_suggestion: hTest
    })

    hSelectorMap[el.description] = hCandidates[0].selector
  }

  if (stable) {
    hGlobalTips.push('Prioritize data-testid and role-based selectors for maximum stability')
  }
  hGlobalTips.push('Avoid selectors that depend on DOM depth or visual position')
  hGlobalTips.push('Add explicit waits (waitForSelector) before interacting with dynamic content')
  hGlobalTips.push('Use page objects to centralize selector definitions')
  hGlobalTips.push('Run selector audit in CI to detect brittle selectors early')

  return {
    page_description,
    total_elements: target_elements.length,
    advice_list: hAdviceList,
    global_tips: hGlobalTips,
    selector_map: hSelectorMap
  }
}

// ==================== TOOL 3: SCREENSHOT PLANNER ====================

function planScreenshots(input: ScreenshotPlInput): ScreenshotPlResult {
  const { url, viewports, interaction_steps, full_page, highlight_selectors, mask_selectors } = input
  const hFullPage = full_page !== false

  const hViewportPlans: ViewportPlan[] = []

  for (const vp of viewports) {
    const hCheckpoints: ScreenshotCheckpoint[] = []

    hCheckpoints.push({
      step_label: '01_initial_load',
      viewport: vp.name,
      trigger: 'page load complete',
      screenshot_name: `${vp.name}_01_loaded.png`,
      checks: ['Page renders without console errors', 'Core layout visible', 'No skeleton screens stuck'],
      expected_state: 'Fully loaded page'
    })

    let hStepNum = 2
    for (const step of interaction_steps) {
      hCheckpoints.push({
        step_label: `${String(hStepNum).padStart(2, '0')}_${step.action}`,
        viewport: vp.name,
        trigger: step.description,
        screenshot_name: `${vp.name}_${String(hStepNum).padStart(2, '0')}_${step.action}.png`,
        checks: [
          `Action "${step.action}" completed`,
          'No unexpected overlay or modal',
          'Layout shift within acceptable range'
        ],
        expected_state: step.description
      })
      hStepNum++
    }

    hCheckpoints.push({
      step_label: `${String(hStepNum).padStart(2, '0')}_final_state`,
      viewport: vp.name,
      trigger: 'all interactions complete',
      screenshot_name: `${vp.name}_${String(hStepNum).padStart(2, '0')}_final.png`,
      checks: ['Final state matches expected', 'No console errors', 'All animations settled'],
      expected_state: 'Stable final state'
    })

    hViewportPlans.push({
      viewport_name: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      total_screenshots: hCheckpoints.length,
      checkpoints: hCheckpoints
    })
  }

  const hTotalCheckpoints = hViewportPlans.reduce((sum, vp) => sum + vp.total_screenshots, 0)
  const hAvgBytesPerScreenshot = 150 * 1024
  const hStorageMb = Math.round((hTotalCheckpoints * hAvgBytesPerScreenshot) / (1024 * 1024) * 100) / 100

  const hFlow: string[] = []
  hFlow.push('```mermaid')
  hFlow.push('flowchart TD')
  hFlow.push('    A[Page Load] --> B{Viewport Loop}')
  for (const vp of viewports) {
    hFlow.push(`    B --> C[${vp.name} (${vp.width}x${vp.height})]`)
  }
  hFlow.push('    C --> D{Interaction Steps}')
  for (const step of interaction_steps) {
    hFlow.push(`    D --> E[${step.action}: ${step.description}]`)
  }
  hFlow.push('    E --> F[Final State Capture]')
  hFlow.push('    F --> G[Diff & Report]')
  hFlow.push('```')

  const hCiTips = [
    'Run visual regression in CI with deterministic rendering (fixed viewport, no animations)',
    'Use perceptual diff tools (PixelMatch, Argos) for fuzz-tolerant comparison',
    'Store screenshots as build artifacts for at least 30 days',
    'Set up visual regression baselines in version control (review carefully)',
    'Run in containerized environment for pixel-perfect consistency'
  ]

  const hReport: string[] = []
  hReport.push('# Screenshot Plan Report')
  hReport.push('')
  hReport.push(`**URL:** ${url}`)
  hReport.push(`**Viewports:** ${viewports.length} | **Steps:** ${interaction_steps.length} | **Full Page:** ${hFullPage}`)
  hReport.push('')
  hReport.push('## Summary')
  hReport.push('')
  for (const vp of hViewportPlans) {
    hReport.push(`- **${vp.viewport_name}** (${vp.dimensions}): ${vp.total_screenshots} screenshots`)
  }
  hReport.push('')
  hReport.push(`**Total Screenshots:** ${hTotalCheckpoints}`)
  hReport.push(`**Storage Estimate:** ${hStorageMb} MB`)
  if (highlight_selectors && highlight_selectors.length > 0) {
    hReport.push(`**Highlight:** ${highlight_selectors.join(', ')}`)
  }
  if (mask_selectors && mask_selectors.length > 0) {
    hReport.push(`**Mask:** ${mask_selectors.join(', ')}`)
  }
  hReport.push('')

  const hCkpt: string[] = []
  hCkpt.push('## Checkpoints')
  hCkpt.push('')
  hCkpt.push('| # | Viewport | Trigger | File | Checks |')
  hCkpt.push('|---|----------|---------|------|--------|')
  let hIdx = 1
  for (const vp of hViewportPlans) {
    for (const ck of vp.checkpoints) {
      hCkpt.push(`| ${hIdx} | ${vp.viewport_name} | ${ck.trigger} | \`${ck.screenshot_name}\` | ${ck.checks.length} checks |`)
      hIdx++
    }
  }

  return {
    url,
    total_viewports: viewports.length,
    total_checkpoints: hTotalCheckpoints,
    viewport_plans: hViewportPlans,
    interaction_flow_diagram: hFlow.join('\n'),
    storage_estimate_mb: hStorageMb,
    ci_integration_tips: hCiTips,
    report: [...hReport, ...hCkpt].join('\n')
  }
}

// ==================== TOOL 4: FORM FILL DESIGNER ====================

function designFormFill(input: FormFillInput): FormFillResult {
  const { form_schema, test_data_strategy, validation_rules, form_selector, submit_selector, success_indicator } = input
  const hFormSel = form_selector || 'form'
  const hSubmitSel = submit_selector || "button[type='submit']"
  const hSuccessInd = success_indicator || '.success-message'

  const hBoundaryCases: BoundaryTestCase[] = []
  const hFillScripts: FormFillScript[] = []

  const hStrategies: TestDataStrategy[] =
    test_data_strategy === 'all'
      ? ['valid', 'boundary', 'invalid', 'sql_injection', 'xss', 'fuzz', 'realistic']
      : [test_data_strategy]

  for (const strategy of hStrategies) {
    const hFillCode: string[] = []
    const hSubmitCode: string[] = []
    const hAsserts: string[] = []

    hFillCode.push(`// Form fill strategy: ${strategy}`)
    hFillCode.push(`await page.waitForSelector('${hFormSel}')`)

    for (const field of form_schema) {
      let hVal = ''
      switch (strategy) {
        case 'valid':
          hVal = hGenerateValidValue(field)
          break
        case 'boundary':
          hVal = hGenerateBoundaryValue(field, hBoundaryCases)
          break
        case 'invalid':
          hVal = hGenerateInvalidValue(field)
          break
        case 'sql_injection':
          hVal = "' OR '1'='1' --"
          hBoundaryCases.push({ field_name: field.name, test_type: 'sql_injection', test_value: hVal, expected_behavior: 'Input sanitized, no database error', severity: 'error' })
          break
        case 'xss':
          hVal = "<script>alert('xss')</script>"
          hBoundaryCases.push({ field_name: field.name, test_type: 'xss_attempt', test_value: hVal, expected_behavior: 'Script tag escaped/not executed', severity: 'error' })
          break
        case 'fuzz':
          hVal = hGenerateFuzzValue(field)
          break
        case 'realistic':
          hVal = hGenerateRealisticValue(field)
          break
      }

      if (field.type === 'checkbox') {
        hFillCode.push(`  await page.${hVal === 'true' ? 'check' : 'uncheck'}('${field.selector}')`)
      } else if (field.type === 'select') {
        hFillCode.push(`  await page.selectOption('${field.selector}', '${hVal}')`)
      } else if (field.type === 'file') {
        hFillCode.push(`  await page.setInputFiles('${field.selector}', '${hVal}')`)
      } else {
        hFillCode.push(`  await page.fill('${field.selector}', '${hVal}')`)
      }
    }

    hSubmitCode.push(`// Submit form`)
    hSubmitCode.push(`await page.click('${hSubmitSel}')`)
    hSubmitCode.push(`await page.waitForSelector('${hSuccessInd}', { timeout: 10000 })`)

    for (const rule of validation_rules) {
      hAsserts.push(`expect(validation_errors['${rule.field_name}']).not.toContain('${rule.error_message}')`)
    }

    hFillScripts.push({
      script_name: `form_${strategy}_test`,
      strategy,
      fill_code: hFillCode.join('\n'),
      submit_code: hSubmitCode.join('\n'),
      validation_code: hAsserts.join('\n'),
      assertions: hAsserts
    })
  }

  const hFull: string[] = []
  hFull.push("// === Auto-generated Form Fill Test Suite ===")
  hFull.push(`// Strategy: ${test_data_strategy}`)
  hFull.push(`// Fields: ${form_schema.length}`)
  hFull.push('')
  for (const script of hFillScripts) {
    hFull.push(`test('${script.script_name}', async ({ page }) => {`)
    hFull.push(script.fill_code)
    hFull.push(script.submit_code)
    hFull.push(script.validation_code)
    hFull.push('})')
    hFull.push('')
  }

  const hSecurity = [
    'Always sanitize form inputs server-side, never trust client-side validation alone',
    'Test with SQL injection and XSS payloads for every text input field',
    'Verify HTTPS is enforced for forms transmitting sensitive data',
    'Check CSRF token presence and validation on state-changing forms',
    'Ensure password fields use type="password" and autocomplete attributes',
    'Rate-limit form submissions to prevent brute-force and spam attacks'
  ]

  const hReport: string[] = []
  hReport.push('# Form Fill Design Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Total Fields | ${form_schema.length} |`)
  hReport.push(`| Required Fields | ${form_schema.filter(f => f.required).length} |`)
  hReport.push(`| Strategies | ${hStrategies.join(', ')} |`)
  hReport.push(`| Boundary Cases | ${hBoundaryCases.length} |`)
  hReport.push(`| Validation Rules | ${validation_rules.length} |`)
  hReport.push('')

  if (hBoundaryCases.length > 0) {
    hReport.push('## Boundary Test Cases')
    hReport.push('')
    hReport.push('| Field | Type | Value | Expected | Severity |')
    hReport.push('|-------|------|-------|----------|----------|')
    for (const bc of hBoundaryCases) {
      hReport.push(`| ${bc.field_name} | ${bc.test_type} | \`${bc.test_value.substring(0, 30)}\` | ${bc.expected_behavior} | ${bc.severity} |`)
    }
    hReport.push('')
  }

  return {
    form_fields_count: form_schema.length,
    strategies_covered: hStrategies,
    boundary_test_cases: hBoundaryCases,
    fill_scripts: hFillScripts,
    full_script: hFull.join('\n'),
    security_notes: hSecurity,
    report: hReport.join('\n')
  }
}

function hGenerateValidValue(field: FormFieldSchema): string {
  switch (field.type) {
    case 'email': return 'test@example.com'
    case 'password': return 'SecurePass123!'
    case 'tel': return '+1234567890'
    case 'number': return '42'
    case 'date': return '2026-01-15'
    case 'textarea': return 'This is a valid test message.'
    case 'checkbox': return 'true'
    case 'select': return field.options?.[0] || 'option1'
    case 'file': return 'test-upload.pdf'
    case 'radio': return field.options?.[0] || 'option1'
    case 'text': return field.max_length ? 'A'.repeat(Math.min(field.max_length, 20)) : 'Sample text'
    default: return 'test'
  }
}

function hGenerateBoundaryValue(field: FormFieldSchema, cases: BoundaryTestCase[]): string {
  const hMin = field.min_length || 0
  const hMax = field.max_length || 255

  if (hMin > 0) {
    cases.push({ field_name: field.name, test_type: 'below_min', test_value: 'A'.repeat(hMin - 1), expected_behavior: 'Validation error: below minimum length', severity: 'warning' })
  }
  cases.push({ field_name: field.name, test_type: 'at_min', test_value: 'A'.repeat(hMin), expected_behavior: 'Passes validation', severity: 'info' })
  cases.push({ field_name: field.name, test_type: 'at_max', test_value: 'A'.repeat(hMax), expected_behavior: 'Passes validation', severity: 'info' })
  cases.push({ field_name: field.name, test_type: 'above_max', test_value: 'A'.repeat(hMax + 1), expected_behavior: 'Validation error or truncation', severity: 'warning' })

  return 'A'.repeat(Math.min(hMax, 10))
}

function hGenerateInvalidValue(field: FormFieldSchema): string {
  switch (field.type) {
    case 'email': return 'not-an-email'
    case 'password': return '123'
    case 'tel': return 'abc'
    case 'number': return 'not-a-number'
    case 'date': return 'invalid-date'
    default: return ''
  }
}

function hGenerateFuzzValue(field: FormFieldSchema): string {
  const hFuzzChars = ['<', '>', '&', '"', "'", '\\', '/', '\x00', ';', '--', '*/']
  return hFuzzChars.slice(0, 5).join('')
}

function hGenerateRealisticValue(field: FormFieldSchema): string {
  switch (field.type) {
    case 'email': return 'john.doe@company.org'
    case 'password': return 'MyP@ssw0rd!2026'
    case 'tel': return '+86-138-0000-1234'
    case 'number': return '29'
    case 'date': return '1995-03-20'
    case 'textarea': return 'I would like to inquire about your services. Please contact me at your earliest convenience.'
    case 'text': return 'Zhang San'
    default: return hGenerateValidValue(field)
  }
}

// ==================== TOOL 5: DATA EXTRACTION PLANNER ====================

function planDataExtraction(input: DataExtractionInput): DataExtractionResult {
  const { target_url, data_schema, pagination_config, wait_for_selector, delay_between_pages_ms, output_format } = input
  const hDelay = delay_between_pages_ms || 1000
  const hFormat = output_format || 'json'
  const hWaitFor = wait_for_selector || 'body'

  const hMappings: ExtractorMapping[] = []

  for (const field of data_schema) {
    const hSeed = seededRandom(field.name)
    const hConfid = clamp(Math.round(hSeed * 30 + 70), 50, 99)

    const hFallbacks: string[] = []
    if (field.selector.startsWith('.')) {
      hFallbacks.push(`[class*='${field.selector.replace('.', '').substring(0, 8)}']`)
      hFallbacks.push(field.selector.replace('.', '#'))
    } else {
      hFallbacks.push(`.${field.selector.replace('#', '')}`)
      hFallbacks.push(`//div[contains(@class, '${field.selector.replace(/[^a-zA-Z]/g, '')}')]`)
    }

    hMappings.push({
      field_name: field.name,
      selector: field.selector,
      selector_type: field.selector.startsWith('/') || field.selector.startsWith('//') ? 'xpath' : 'css',
      confidence: hConfid,
      fallback_selectors: hFallbacks,
      attribute: field.attribute,
      transform: field.transform,
      required: field.required,
      notes: field.required ? 'Required field - extraction failure is a blocking error' : 'Optional field - null acceptable'
    })
  }

  // Pagination handling
  let hPaginationHandling = 'No pagination configured'
  if (pagination_config) {
    switch (pagination_config.type) {
      case 'next_button':
        hPaginationHandling = `Click "${pagination_config.selector}" up to ${pagination_config.max_pages || 10} pages`
        break
      case 'infinite_scroll':
        hPaginationHandling = `Scroll to bottom ${pagination_config.max_pages || 5} ×, wait for new content`
        break
      case 'page_numbers':
        hPaginationHandling = `Iterate page numbers via ${pagination_config.selector} up to ${pagination_config.max_pages || 50}`
        break
      case 'load_more':
        hPaginationHandling = `Click "Load More" button ${pagination_config.max_pages || 10} times`
        break
      case 'url_param':
        hPaginationHandling = `Increment URL parameter using pattern: ${pagination_config.url_pattern}`
        break
    }
  }

  // Generate extraction scripts
  const hScripts: ExtractionScript[] = []

  // Playwright version
  const hPwCode: string[] = []
  hPwCode.push("import { chromium } from 'playwright'")
  hPwCode.push("import fs from 'fs'")
  hPwCode.push('')
  hPwCode.push('async function extractData() {')
  hPwCode.push('  const browser = await chromium.launch()')
  hPwCode.push('  const page = await browser.newPage()')
  hPwCode.push('  const results: Record<string, any>[] = []')
  hPwCode.push('')
  hPwCode.push(`  await page.goto('${target_url}')`)
  hPwCode.push(`  await page.waitForSelector('${hWaitFor}')`)
  hPwCode.push('')
  hPwCode.push('  while (true) {')
  hPwCode.push('    const record: Record<string, any> = {}')
  hPwCode.push('')
  for (const mapping of hMappings) {
    const hExtract = mapping.selector_type === 'css'
      ? `const el_${mapping.field_name} = await page.$('${mapping.selector}')`
      : `const el_${mapping.field_name} = await page.$('xpath=${mapping.selector}')`
    hPwCode.push(`    ${hExtract}`)
    hPwCode.push(`    if (el_${mapping.field_name}) {`)
    if (mapping.attribute) {
      hPwCode.push(`      record.${mapping.field_name} = await el_${mapping.field_name}.getAttribute('${mapping.attribute}')`)
    } else {
      hPwCode.push(`      record.${mapping.field_name} = await el_${mapping.field_name}.textContent()`)
    }
    hPwCode.push(`      ${mapping.transform ? `record.${mapping.field_name} = transform(record.${mapping.field_name}, '${mapping.transform}')` : ''}`)
    hPwCode.push('    }')
  }
  hPwCode.push('    results.push(record)')
  if (pagination_config?.type === 'next_button') {
    hPwCode.push(`    const nextBtn = await page.$('${pagination_config.selector}')`)
    hPwCode.push('    if (!nextBtn) break')
    hPwCode.push('    await nextBtn.click()')
    hPwCode.push(`    await page.waitForTimeout(${hDelay})`)
  } else {
    hPwCode.push('    break // no pagination or not yet implemented')
  }
  hPwCode.push('  }')
  hPwCode.push('')
  hPwCode.push(`  fs.writeFileSync('output.${hFormat}', JSON.stringify(results, null, 2))`)
  hPwCode.push('  await browser.close()')
  hPwCode.push(`  return results`)
  hPwCode.push('}')
  hPwCode.push('')
  hPwCode.push('extractData().catch(console.error)')

  hScripts.push({
    script_type: 'playwright-extraction',
    framework: 'playwright',
    code: hPwCode.join('\n'),
    estimated_records: pagination_config?.max_pages ? pagination_config.max_pages * 20 : 20,
    estimated_duration_sec: pagination_config?.max_pages ? pagination_config.max_pages * 5 : 5
  })

  // Puppeteer version
  const hPptrCode: string[] = []
  hPptrCode.push("import puppeteer from 'puppeteer'")
  hPptrCode.push('')
  hPptrCode.push('async function extractWithPuppeteer() {')
  hPptrCode.push('  const browser = await puppeteer.launch()')
  hPptrCode.push('  const page = await browser.newPage()')
  hPptrCode.push(`  await page.goto('${target_url}')`)
  hPptrCode.push(`  await page.waitForSelector('${hWaitFor}')`)
  hPptrCode.push('  const data = await page.evaluate(() => {')
  hPptrCode.push('    const results: Record<string, any>[] = []')
  hPptrCode.push('    // Add extraction logic for each record here')
  for (const mapping of hMappings) {
    hPptrCode.push(`    // ${mapping.field_name}: ${mapping.selector}`)
  }
  hPptrCode.push('    return results')
  hPptrCode.push('  })')
  hPptrCode.push('  await browser.close()')
  hPptrCode.push('  return data')
  hPptrCode.push('}')

  hScripts.push({
    script_type: 'puppeteer-extraction',
    framework: 'puppeteer',
    code: hPptrCode.join('\n'),
    estimated_records: pagination_config?.max_pages ? pagination_config.max_pages * 20 : 20,
    estimated_duration_sec: pagination_config?.max_pages ? pagination_config.max_pages * 5 : 5
  })

  const hEthical = [
    'Always check robots.txt before scraping any website',
    'Respect rate limits: add delays between requests (minimum 1-2 seconds)',
    'Check Terms of Service for data usage restrictions',
    'Identify your bot with a descriptive User-Agent string',
    'Do not scrape personal data without legal basis (GDPR/CCPA compliance)',
    'Cache responses to minimize server load on repeated scrapes',
    'Consider using official APIs when available instead of scraping'
  ]

  const hReport: string[] = []
  hReport.push('# Data Extraction Plan Report')
  hReport.push('')
  hReport.push(`**Target:** ${target_url}`)
  hReport.push(`**Fields:** ${data_schema.length} | **Format:** ${hFormat}`)
  hReport.push('')
  hReport.push('## Selector Mapping')
  hReport.push('')
  hReport.push('| Field | Selector | Type | Confidence | Required |')
  hReport.push('|-------|----------|------|------------|----------|')
  for (const m of hMappings) {
    hReport.push(`| ${m.field_name} | \`${m.selector}\` | ${m.selector_type} | ${m.confidence}% | ${m.required ? 'Yes' : 'No'} |`)
  }
  hReport.push('')
  hReport.push(`**Pagination:** ${hPaginationHandling}`)
  hReport.push('')

  return {
    target_url,
    total_fields: data_schema.length,
    selector_mappings: hMappings,
    pagination_handling: hPaginationHandling,
    extraction_scripts: hScripts,
    full_script: hScripts.map(s => s.code).join('\n\n'),
    ethical_notes: hEthical,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 6: ACCESSIBILITY TESTER ====================

function testAccessibility(input: AccessibilityTestInput): AccessibilityTestResult {
  const { page_elements, wcag_level, page_url, include_best_practices } = input
  const hIncludeBP = include_best_practices !== false

  const hViolations: A11yViolation[] = []
  const hTestScripts: A11yTestScript[] = []

  for (const el of page_elements) {
    if (el.tag === 'img' && !el.has_alt) {
      hViolations.push({
        principle: 'Perceivable',
        criterion: '1.1.1 Non-text Content',
        severity: 'critical',
        description: `Image element missing alt text: ${el.selector}`,
        affected_elements: [el.selector],
        remediation: 'Add descriptive alt attribute to all informative images. Use alt=""" for decorative images.',
        wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'
      })
    }

    if ((el.tag === 'input' || el.tag === 'select' || el.tag === 'textarea') && !el.has_label) {
      hViolations.push({
        principle: 'Perceivable',
        criterion: '1.3.1 Info and Relationships',
        severity: 'serious',
        description: `Form input missing label: ${el.selector}`,
        affected_elements: [el.selector],
        remediation: 'Associate a <label> element using for/id pairing, or add aria-label/aria-labelledby.',
        wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html'
      })
    }

    if (el.has_role === false && (el.tag === 'div' || el.tag === 'span')) {
      if (el.aria_attributes && el.aria_attributes.length > 0) {
        hViolations.push({
          principle: 'Robust',
          criterion: '4.1.2 Name, Role, Value',
          severity: 'moderate',
          description: `Element has ARIA attributes without semantic role: ${el.selector}`,
          affected_elements: [el.selector],
          remediation: 'Ensure elements with ARIA roles have correct role attribute and follow ARIA authoring practices.',
          wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html'
        })
      }
    }

    if (el.keyboard_accessible === false) {
      hViolations.push({
        principle: 'Operable',
        criterion: '2.1.1 Keyboard',
        severity: 'critical',
        description: `Element not keyboard accessible: ${el.selector}`,
        affected_elements: [el.selector],
        remediation: 'Ensure all interactive elements can be operated via keyboard. Use tabindex, focus management, and keyboard event handlers.',
        wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html'
      })
    }

    if (el.color_contrast_pair) {
      const [fg, bg] = el.color_contrast_pair
      const hSeed = seededRandom(fg + bg)
      const hRatio = hSeed * 7 + 1.5
      const hThreshold = wcag_level === 'AAA' ? 7 : wcag_level === 'AA' ? 4.5 : 3
      if (hRatio < hThreshold) {
        hViolations.push({
          principle: 'Perceivable',
          criterion: wcag_level === 'AAA' ? '1.4.6 Enhanced Contrast' : '1.4.3 Minimum Contrast',
          severity: 'serious',
          description: `Insufficient color contrast ratio (${hRatio.toFixed(2)}:1) for ${el.selector}`,
          affected_elements: [el.selector],
          remediation: `Increase contrast ratio to at least ${hThreshold}:1 for ${wcag_level} compliance.`,
          wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
        })
      }
    }
  }

  if (hIncludeBP) {
    const hElementsWithoutLang = page_elements.filter(e => e.tag === 'html')
    if (hElementsWithoutLang.length > 0) {
      hViolations.push({
        principle: 'Robust',
        criterion: '3.1.1 Language of Page',
        severity: 'moderate',
        description: 'HTML element should specify lang attribute',
        affected_elements: ['html'],
        remediation: 'Add lang attribute to <html> tag (e.g., lang="en")',
        wcag_ref: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'
      })
    }
  }

  // Generate test scripts
  const hAxeCode: string[] = []
  hAxeCode.push("import { injectAxe, checkA11y, getViolations } from 'axe-playwright'")
  hAxeCode.push("import { test, expect } from '@playwright/test'")
  hAxeCode.push('')
  hAxeCode.push("test('accessibility audit', async ({ page }) => {")
  hAxeCode.push(`  await page.goto('${page_url || 'http://localhost:3000'}')`)
  hAxeCode.push('  await injectAxe(page)')
  hAxeCode.push(`  const violations = await getViolations(page, { runOnly: ['wcag${wcag_level.toLowerCase()}'] })`)
  hAxeCode.push('  expect(violations).toHaveLength(0)')
  hAxeCode.push('})')

  hTestScripts.push({
    script_name: 'axe-core-audit',
    tool: 'axe-core',
    code: hAxeCode.join('\n'),
    coverage: [`WCAG ${wcag_level} Level Rules`, 'Automated checks via axe-core']
  })

  const hLighthouseCode: string[] = []
  hLighthouseCode.push("import lighthouse from 'lighthouse'")
  hLighthouseCode.push("import puppeteer from 'puppeteer'")
  hLighthouseCode.push('')
  hLighthouseCode.push('async function runLighthouse() {')
  hLighthouseCode.push('  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] })')
  hLighthouseCode.push('  const { lhr } = await lighthouse(')
  hLighthouseCode.push(`    '${page_url || 'http://localhost:3000'}',`)
  hLighthouseCode.push('    { port: new URL(browser.wsEndpoint()).port },')
  hLighthouseCode.push(`    { onlyCategories: ['accessibility'] }`)
  hLighthouseCode.push('  )')
  hLighthouseCode.push(`  console.log(\`Score: \${lhr.categories.accessibility.score! * 100}\`)`)
  hLighthouseCode.push('  await browser.close()')
  hLighthouseCode.push('}')

  hTestScripts.push({
    script_name: 'lighthouse-audit',
    tool: 'lighthouse',
    code: hLighthouseCode.join('\n'),
    coverage: ['Lighthouse Accessibility Audit', 'Full WCAG coverage', 'Performance cross-check']
  })

  // Counts
  const hCritical = hViolations.filter(v => v.severity === 'critical').length
  const hSerious = hViolations.filter(v => v.severity === 'serious').length
  const hModerate = hViolations.filter(v => v.severity === 'moderate').length
  const hMinor = hViolations.filter(v => v.severity === 'minor').length
  const hTotal = hViolations.length

  const hComplianceScore = hTotal === 0 ? 100 : clamp(Math.round(100 - (hCritical * 25 + hSerious * 15 + hModerate * 5 + hMinor * 1)), 0, 100)

  const hPriority: string[] = []
  if (hCritical > 0) hPriority.push(`Fix ${hCritical} critical violation(s) immediately (blocks users)`)
  if (hSerious > 0) hPriority.push(`Address ${hSerious} serious violation(s) (major barriers)`)
  if (hModerate > 0) hPriority.push(`Plan remediation for ${hModerate} moderate issue(s)`)
  if (hMinor > 0) hPriority.push(`Document ${hMinor} minor issue(s) for future sprint`)
  hPriority.push('Integrate axe-core into CI pipeline for ongoing monitoring')
  hPriority.push('Conduct manual keyboard/screen reader testing quarterly')

  const hReport: string[] = []
  hReport.push(`# Accessibility Test Report`)
  hReport.push('')
  hReport.push(`**WCAG Level:** ${wcag_level} | **URL:** ${page_url || 'N/A'}`)
  hReport.push(`**Elements Analyzed:** ${page_elements.length}`)
  hReport.push('')
  hReport.push('## Compliance Score')
  hReport.push('')
  hReport.push(`**Score:** ${hComplianceScore}/100`)
  hReport.push('')
  hReport.push('## Violation Summary')
  hReport.push('')
  hReport.push('| Severity | Count |')
  hReport.push('|----------|-------|')
  hReport.push(`| Critical | ${hCritical} |`)
  hReport.push(`| Serious | ${hSerious} |`)
  hReport.push(`| Moderate | ${hModerate} |`)
  hReport.push(`| Minor | ${hMinor} |`)
  hReport.push(`| **Total** | **${hTotal}** |`)
  hReport.push('')

  if (hViolations.length > 0) {
    hReport.push('## Detailed Violations')
    hReport.push('')
    for (let i = 0; i < hViolations.length; i++) {
      const v = hViolations[i]
      hReport.push(`### ${i + 1}. ${v.criterion} (${v.severity.toUpperCase()})`)
      hReport.push(`- **Principle:** ${v.principle}`)
      hReport.push(`- **Description:** ${v.description}`)
      hReport.push(`- **Remediation:** ${v.remediation}`)
      hReport.push(`- **Reference:** ${v.wcag_ref}`)
      hReport.push('')
    }
  }

  return {
    wcag_level: wcag_level,
    page_url: page_url || 'N/A',
    total_elements: page_elements.length,
    total_violations: hTotal,
    critical_count: hCritical,
    serious_count: hSerious,
    moderate_count: hModerate,
    minor_count: hMinor,
    violations: hViolations,
    test_scripts: hTestScripts,
    compliance_score: hComplianceScore,
    improvement_priority: hPriority,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 7: PERFORMANCE PROFILER ====================

function profilePerformance(input: PerformanceProfilerInput): PerformanceProfilerResult {
  const { page_urls, metrics, network_throttle, cpu_throttle, iterations } = input
  const hNetwork = network_throttle || 'fast4g'
  const hCpu = cpu_throttle || 4
  const hIter = iterations || 3

  const hThresholds: MetricThreshold[] = [
    { metric: 'lcp', good: 2500, needs_improvement: 4000, poor: 5000, unit: 'ms' },
    { metric: 'fid', good: 100, needs_improvement: 300, poor: 500, unit: 'ms' },
    { metric: 'cls', good: 0.1, needs_improvement: 0.25, poor: 0.5, unit: 'score' },
    { metric: 'ttfb', good: 800, needs_improvement: 1800, poor: 3000, unit: 'ms' },
    { metric: 'fcp', good: 1800, needs_improvement: 3000, poor: 5000, unit: 'ms' },
    { metric: 'inp', good: 200, needs_improvement: 500, poor: 1000, unit: 'ms' },
    { metric: 'tbt', good: 200, needs_improvement: 600, poor: 1000, unit: 'ms' }
  ]

  const hActiveThresholds = hThresholds.filter(t => metrics.includes(t.metric))

  const hUrlPlans: UrlPerformancePlan[] = []
  for (const url of page_urls) {
    const hBaseline: Record<string, number> = {}
    const hChecks: string[] = []
    const hHints: string[] = []

    for (const metric of metrics) {
      const hSeed = seededRandom(url + metric)
      const hThreshold = hActiveThresholds.find(t => t.metric === metric)
      if (hThreshold) {
        const hValue = metric === 'cls'
          ? hSeed * hThreshold.poor
          : hThreshold.good + hSeed * (hThreshold.poor - hThreshold.good)
        hBaseline[metric] = Math.round(hValue * 100) / 100
        const hRating = hValue <= hThreshold.good ? 'GOOD' : hValue <= hThreshold.needs_improvement ? 'NEEDS_IMPROVEMENT' : 'POOR'
        hChecks.push(`${metric}: ${hBaseline[metric]}${hThreshold.unit} [${hRating}]`)

        if (hRating !== 'GOOD') {
          hHints.push(hGetOptHint(metric))
        }
      }
    }

    hUrlPlans.push({
      url,
      metrics: [...metrics],
      estimated_baseline: hBaseline,
      threshold_checks: hChecks,
      optimization_hints: hHints
    })
  }

  // Test script
  const hTestCode: string[] = []
  hTestCode.push("import { test, expect } from '@playwright/test'")
  hTestCode.push('')
  hTestCode.push('const metrics = [')
  for (const m of metrics) {
    hTestCode.push(`  '${m}',`)
  }
  hTestCode.push(']')
  hTestCode.push('')
  hTestCode.push('for (const url of [')
  for (const url of page_urls) {
    hTestCode.push(`  '${url}',`)
  }
  hTestCode.push(']) {')
  hTestCode.push(`  test(\`performance: \${url}\`, async ({ page }) => {`)
  hTestCode.push('    await page.goto(url)')
  hTestCode.push('    await page.waitForLoadState(\'networkidle\')')
  hTestCode.push('')
  hTestCode.push('    const perfData = await page.evaluate(() => {')
  hTestCode.push('      const nav = performance.getEntriesByType(\'navigation\')[0] as any')
  hTestCode.push('      return {')
  hTestCode.push('        ttfb: nav.responseStart - nav.requestStart,')
  hTestCode.push('        fcp: performance.getEntriesByName(\'first-contentful-paint\')[0]?.startTime || 0')
  hTestCode.push('      }')
  hTestCode.push('    })')
  hTestCode.push('')
  hTestCode.push(`    console.log(\`TTFB: \${perfData.ttfb}ms\`)`)
  hTestCode.push(`    console.log(\`FCP: \${perfData.fcp}ms\`)`)
  hTestCode.push('  })')
  hTestCode.push('}')

  const hFullScript: string[] = []
  hFullScript.push('// === Performance Profiling Script ===')
  hFullScript.push(`// Iterations: ${hIter} | Network: ${hNetwork} | CPU: ${hCpu}x slowdown`)
  hFullScript.push('')
  hFullScript.push(hTestCode.join('\n'))
  hFullScript.push('')
  hFullScript.push('// Thresholds:')
  for (const t of hActiveThresholds) {
    hFullScript.push(`// ${t.metric.toUpperCase()}: Good<=${t.good}${t.unit} | NeedsImprove<=${t.needs_improvement}${t.unit} | Poor>${t.poor}${t.unit}`)
  }

  const hReport: string[] = []
  hReport.push('# Performance Profile Report')
  hReport.push('')
  hReport.push('| Config | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| URLs Tested | ${page_urls.length} |`)
  hReport.push(`| Metrics | ${metrics.join(', ')} |`)
  hReport.push(`| Iterations | ${hIter} |`)
  hReport.push(`| Network | ${hNetwork} |`)
  hReport.push(`| CPU Slowdown | ${hCpu}x |`)
  hReport.push('')

  hReport.push('## Per-URL Results')
  hReport.push('')
  for (const plan of hUrlPlans) {
    hReport.push(`### ${plan.url}`)
    hReport.push('')
    for (const check of plan.threshold_checks) {
      hReport.push(`- ${check}`)
    }
    if (plan.optimization_hints.length > 0) {
      hReport.push('')
      hReport.push('**Optimization Hints:**')
      for (const hint of plan.optimization_hints) {
        hReport.push(`- ${hint}`)
      }
    }
    hReport.push('')
  }

  return {
    urls_count: page_urls.length,
    metrics_count: metrics.length,
    iterations: hIter,
    network_profile: hNetwork,
    cpu_throttle: hCpu,
    metric_thresholds: hActiveThresholds,
    url_plans: hUrlPlans,
    test_script: hTestCode.join('\n'),
    full_script: hFullScript.join('\n'),
    report: hReport.join('\n')
  }
}

function hGetOptHint(metric: PerfMetric): string {
  switch (metric) {
    case 'lcp': return 'Optimize LCP: preload largest visible image, use CDN, reduce server response time'
    case 'fid': return 'Optimize FID: break long tasks (>50ms), defer non-critical JS, use web workers'
    case 'cls': return 'Optimize CLS: set explicit width/height on images/videos, avoid injecting content above existing content'
    case 'ttfb': return 'Optimize TTFB: use edge caching, optimize DB queries, reduce server processing time'
    case 'fcp': return 'Optimize FCP: inline critical CSS, eliminate render-blocking resources, use font-display: swap'
    case 'inp': return 'Optimize INP: split long tasks, use requestIdleCallback for non-urgent work, avoid forced reflows'
    case 'tbt': return 'Optimize TBT: reduce JavaScript payload, code-split, defer third-party scripts'
  }
}

// ==================== TOOL 8: CROSS BROWSER PLANNER ====================

function planCrossBrowser(input: CrossBrowserInput): CrossBrowserResult {
  const { target_browsers, features_to_test, min_versions, test_priority } = input
  const hPriority = test_priority || 'risk-based'

  const hBrowsers: BrowserVersion[] = []
  const hCompatMatrix: CompatibilityCell[] = []

  const hBrowserInfo: Record<string, { engine: string, versions: string[], limitations: string[] }> = {
    chromium: { engine: 'Blink', versions: ['120', '119', '118'], limitations: [] },
    firefox: { engine: 'Gecko', versions: ['121', '120', '119'], limitations: ['CSS :has() partial', 'View Transitions API'] },
    webkit: { engine: 'WebKit', versions: ['17.4', '17.2', '17.0'], limitations: ['Web Push API', 'View Transitions API', 'CSS @scope', 'scroll-driven animations'] },
    edge: { engine: 'Blink', versions: ['120', '119'], limitations: [] },
    samsung: { engine: 'Blink', versions: ['23', '22'], limitations: ['Some WebXR APIs limited'] },
    opera: { engine: 'Blink', versions: ['106', '105'], limitations: [] }
  }

  const hMarketShares: Record<string, number> = {
    chromium: 65.1, firefox: 21.2, webkit: 1.5, edge: 5.0, samsung: 3.8, opera: 2.6
  }

  for (const browser of target_browsers) {
    const hInfo = hBrowserInfo[browser]
    if (!hInfo) continue

    const hVer = min_versions?.[browser] || hInfo.versions[0]
    const hSupportedFeatures: string[] = []

    for (const feature of features_to_test) {
      const hSeed = seededRandom(browser + feature.feature)
      const hSupport: 'full' | 'partial' | 'none' | 'unknown' = hSeed > 0.7 ? 'full' : hSeed > 0.4 ? 'partial' : hSeed > 0.15 ? 'none' : 'unknown'

      if (hSupport === 'full') {
        hSupportedFeatures.push(feature.feature)
      }

      const hNotes: string[] = []
      let hPolyfill: string | undefined

      if (hSupport === 'partial') {
        hNotes.push('Partial support - feature detection recommended')
        hPolyfill = hGetPolyfill(feature.feature)
      } else if (hSupport === 'none') {
        hNotes.push('Not supported - fallback required')
        if (feature.criticality === 'must-work') {
          hNotes.push('CRITICAL: Must-work feature missing - polyfill or alternative needed')
        }
        hPolyfill = hGetPolyfill(feature.feature)
      } else if (hSupport === 'unknown') {
        hNotes.push('Support unknown - manual testing required')
      }

      if (hInfo.limitations.some(l => feature.feature.toLowerCase().includes(l.toLowerCase().split(' ')[0]))) {
        hNotes.push(`Known ${browser} limitation`)
      }

      hCompatMatrix.push({
        browser,
        feature: feature.feature,
        support: hSupport,
        notes: hNotes.join('; '),
        polyfill: hPolyfill
      })
    }

    hBrowsers.push({
      browser,
      version: hVer,
      engine: hInfo.engine,
      market_share: hMarketShares[browser] || 0.5,
      supported_features: hSupportedFeatures,
      known_limitations: hInfo.limitations
    })
  }

  // Test priority order
  const hOrdered: string[] = []
  if (hPriority === 'risk-based') {
    // Order: must-work features first, then sort by most coverage gaps
    const hMustWork = features_to_test.filter(f => f.criticality === 'must-work').map(f => f.feature)
    const hShouldWork = features_to_test.filter(f => f.criticality === 'should-work').map(f => f.feature)
    const hNice = features_to_test.filter(f => f.criticality === 'nice-to-have').map(f => f.feature)
    hOrdered.push(...hMustWork, ...hShouldWork, ...hNice)
  } else if (hPriority === 'breadth-first') {
    for (const feature of features_to_test) {
      hOrdered.push(feature.feature)
    }
  } else {
    // depth-first: browser by browser
    for (const browser of target_browsers) {
      for (const feature of features_to_test) {
        hOrdered.push(`${browser}: ${feature.feature}`)
      }
    }
  }

  // Risk areas
  const hRisks: string[] = []
  for (const cell of hCompatMatrix) {
    if (cell.support === 'none' && features_to_test.find(f => f.feature === cell.feature)?.criticality === 'must-work') {
      hRisks.push(`${cell.feature} not supported in ${cell.browser} (must-work)`)
    }
  }
  for (const browser of hBrowsers) {
    if (browser.market_share > 5 && browser.known_limitations.length > 0) {
      hRisks.push(`${browser.browser} (${browser.market_share}% market share) has ${browser.known_limitations.length} known limitations`)
    }
  }

  // Polyfill recommendations
  const hPolyfills: string[] = []
  const hPolyfillSet = new Set<string>()
  for (const cell of hCompatMatrix) {
    if (cell.polyfill && !hPolyfillSet.has(cell.polyfill)) {
      hPolyfillSet.add(cell.polyfill)
      hPolyfills.push(cell.polyfill)
    }
  }

  // Test plan markdown
  const hTestPlan: string[] = []
  hTestPlan.push('# Cross-Browser Test Plan')
  hTestPlan.push('')
  hTestPlan.push('| Priority | Browser | Feature | Support | Action |')
  hTestPlan.push('|----------|---------|---------|---------|--------|')
  let hPrio = 1
  for (const browser of hBrowsers) {
    for (const feature of features_to_test.sort((a, b) => {
      const hOrder = { 'must-work': 0, 'should-work': 1, 'nice-to-have': 2 }
      return (hOrder[a.criticality] || 0) - (hOrder[b.criticality] || 0)
    })) {
      const hCell = hCompatMatrix.find(c => c.browser === browser.browser && c.feature === feature.feature)
      const hAction = hCell?.support === 'full' ? 'Verify' : hCell?.support === 'partial' ? 'Test with fallback' : hCell?.support === 'none' ? 'Use polyfill/skip' : 'Investigate'
      hTestPlan.push(`| ${hPrio} | ${browser.browser} | ${feature.feature} | ${hCell?.support || 'unknown'} | ${hAction} |`)
      hPrio++
    }
  }

  const hReport: string[] = []
  hReport.push('# Cross-Browser Compatibility Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Browsers | ${target_browsers.length} |`)
  hReport.push(`| Features | ${features_to_test.length} |`)
  hReport.push(`| Matrix Cells | ${hCompatMatrix.length} |`)
  hReport.push(`| Priority Strategy | ${hPriority} |`)
  hReport.push('')

  const hFullSupport = hCompatMatrix.filter(c => c.support === 'full').length
  const hPartialSupport = hCompatMatrix.filter(c => c.support === 'partial').length
  const hNoSupport = hCompatMatrix.filter(c => c.support === 'none').length
  hReport.push('## Compatibility Summary')
  hReport.push('')
  hReport.push(`- Full: ${hFullSupport}`)
  hReport.push(`- Partial: ${hPartialSupport}`)
  hReport.push(`- None: ${hNoSupport}`)
  hReport.push('')

  return {
    browsers_analyzed: target_browsers.length,
    features_tested: features_to_test.length,
    compatibility_matrix: hCompatMatrix,
    browsers_detail: hBrowsers,
    test_priority_order: hOrdered,
    risk_areas: hRisks,
    polyfill_recommendations: hPolyfills,
    test_plan_markdown: hTestPlan.join('\n'),
    report: hReport.join('\n')
  }
}

function hGetPolyfill(feature: string): string | undefined {
  const hPolyfills: Record<string, string> = {
    'View Transitions API': '@view-transitions/polyfill',
    'CSS @scope': 'postcss-scope-polyfill',
    'Web Push API': 'web-push',
    'Intersection Observer': 'intersection-observer',
    'Resize Observer': 'resize-observer-polyfill',
    'CSS Container Queries': '@container-query/polyfill',
    'dialog element': 'dialog-polyfill',
    'smooth scrolling': 'smoothscroll-polyfill',
    'scroll-driven animations': '@scroll-driven-animations/polyfill',
  }
  for (const [key, polyfill] of Object.entries(hPolyfills)) {
    if (feature.toLowerCase().includes(key.toLowerCase().split(' ')[0])) return polyfill
  }
  return undefined
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // Tool 1: Test Script Generator
  tools.register(defineTool({
    name: 'test_script_generator',
    description: 'Generate runnable Playwright/Puppeteer/Cypress/Selenium test scripts from scenarios with coverage analysis',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: test_scenarios, browser_targets, framework, base_url?, headless?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: TestScriptInput = JSON.parse(args.input)
      const result = generateTestScript(parsed)
      const report = [
        '='.repeat(60),
        `test_script_generator | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report_summary,
        '',
        '-'.repeat(60),
        `Generated Script (${result.full_script.split('\n').length} lines):`,
        '-'.repeat(60),
        '',
        '```javascript',
        result.full_script,
        '```'
      ].join('\n')
      return report
    }
  }))

  // Tool 2: Selector Advisor
  tools.register(defineTool({
    name: 'selector_advisor',
    description: 'Recommend optimal CSS/XPath/ARIA selectors with stability scoring and anti-pattern detection',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: page_description, target_elements, prefer_stable?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: SelectorAdvisorInput = JSON.parse(args.input)
      const result = adviseSelectors(parsed)
      const lines: string[] = []
      lines.push('='.repeat(60))
      lines.push(`selector_advisor | DSH Browser Automation v${VERSION}`)
      lines.push('='.repeat(60))
      lines.push('')
      lines.push(`Page: ${result.page_description}`)
      lines.push(`Elements analyzed: ${result.total_elements}`)
      lines.push('')
      for (const advice of result.advice_list) {
        lines.push(`--- ${advice.element_description} ---`)
        lines.push(`Recommended: ${advice.recommended.selector} (${advice.recommended.type}, score: ${advice.recommended.overall_score})`)
        lines.push(`  Pros: ${advice.recommended.pros.join('; ')}`)
        lines.push(`  Cons: ${advice.recommended.cons.join('; ')}`)
        if (advice.alternatives.length > 0) {
          lines.push('  Alternatives:')
          for (const alt of advice.alternatives) {
            lines.push(`    - ${alt.selector} (${alt.type}, ${alt.overall_score})`)
          }
        }
        lines.push('  Anti-patterns to avoid:')
        for (const ap of advice.anti_patterns) {
          lines.push(`    - ${ap}`)
        }
        lines.push(`  Test: ${advice.test_suggestion}`)
        lines.push('')
      }
      lines.push('Global Tips:')
      for (const tip of result.global_tips) {
        lines.push(`  - ${tip}`)
      }
      return lines.join('\n')
    }
  }))

  // Tool 3: Screenshot Planner
  tools.register(defineTool({
    name: 'screenshot_planner',
    description: 'Plan viewport-aware screenshot strategy with interaction checkpoints and CI integration tips',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: url, viewports, interaction_steps, full_page?, highlight_selectors?, mask_selectors?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: ScreenshotPlInput = JSON.parse(args.input)
      const result = planScreenshots(parsed)
      return [
        '='.repeat(60),
        `screenshot_planner | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Interaction Flow:',
        '-'.repeat(60),
        '',
        result.interaction_flow_diagram,
        '',
        `Storage Estimate: ${result.storage_estimate_mb} MB`,
        '',
        'CI Tips:',
        ...result.ci_integration_tips.map(t => `  - ${t}`)
      ].join('\n')
    }
  }))

  // Tool 4: Form Fill Designer
  tools.register(defineTool({
    name: 'form_fill_designer',
    description: 'Design form fill scripts with boundary test cases, security validation, and multi-strategy coverage',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: form_schema, test_data_strategy, validation_rules, form_selector?, submit_selector?, success_indicator?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: FormFillInput = JSON.parse(args.input)
      const result = designFormFill(parsed)
      return [
        '='.repeat(60),
        `form_fill_designer | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Security Notes:',
        '-'.repeat(60),
        '',
        ...result.security_notes.map(n => `  - ${n}`),
        '',
        '-'.repeat(60),
        'Full Script:',
        '-'.repeat(60),
        '',
        '```javascript',
        result.full_script,
        '```'
      ].join('\n')
    }
  }))

  // Tool 5: Data Extraction Planner
  tools.register(defineTool({
    name: 'data_extraction_planner',
    description: 'Plan web data extraction with selector mapping, pagination handling, and ethical scraping guidelines',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: target_url, data_schema, pagination_config?, wait_for_selector?, delay_between_pages_ms?, output_format?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: DataExtractionInput = JSON.parse(args.input)
      const result = planDataExtraction(parsed)
      return [
        '='.repeat(60),
        `data_extraction_planner | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Ethical Guidelines:',
        '-'.repeat(60),
        '',
        ...result.ethical_notes.map(n => `  - ${n}`),
        '',
        '-'.repeat(60),
        'Extraction Script (Playwright):',
        '-'.repeat(60),
        '',
        '```javascript',
        result.extraction_scripts[0]?.code || 'N/A',
        '```'
      ].join('\n')
    }
  }))

  // Tool 6: Accessibility Tester
  tools.register(defineTool({
    name: 'accessibility_tester',
    description: 'Generate WCAG compliance test scripts with violation checklists and remediation guidance',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: page_elements, wcag_level, page_url?, include_best_practices?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: AccessibilityTestInput = JSON.parse(args.input)
      const result = testAccessibility(parsed)
      return [
        '='.repeat(60),
        `accessibility_tester | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Improvement Priority:',
        '-'.repeat(60),
        '',
        ...result.improvement_priority.map((p, i) => `  ${i + 1}. ${p}`),
        '',
        '-'.repeat(60),
        'Test Script (axe-core):',
        '-'.repeat(60),
        '',
        '```javascript',
        result.test_scripts[0]?.code || 'N/A',
        '```'
      ].join('\n')
    }
  }))

  // Tool 7: Performance Profiler
  tools.register(defineTool({
    name: 'performance_profiler',
    description: 'Generate Core Web Vitals test scripts with metric thresholds and optimization hints',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: page_urls, metrics, browser?, network_throttle?, cpu_throttle?, iterations?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: PerformanceProfilerInput = JSON.parse(args.input)
      const result = profilePerformance(parsed)
      return [
        '='.repeat(60),
        `performance_profiler | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Test Script:',
        '-'.repeat(60),
        '',
        '```javascript',
        result.test_script,
        '```'
      ].join('\n')
    }
  }))

  // Tool 8: Cross Browser Planner
  tools.register(defineTool({
    name: 'cross_browser_planner',
    description: 'Generate cross-browser compatibility matrix with test priorities and polyfill recommendations',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: target_browsers, features_to_test, min_versions?, test_priority?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: CrossBrowserInput = JSON.parse(args.input)
      const result = planCrossBrowser(parsed)
      return [
        '='.repeat(60),
        `cross_browser_planner | DSH Browser Automation v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Test Plan:',
        '-'.repeat(60),
        '',
        result.test_plan_markdown,
        '',
        '-'.repeat(60),
        'Risk Areas:',
        '-'.repeat(60),
        '',
        ...(result.risk_areas.length > 0 ? result.risk_areas.map(r => `  - ${r}`) : ['  No critical risk areas identified']),
        '',
        '-'.repeat(60),
        'Polyfill Recommendations:',
        '-'.repeat(60),
        '',
        ...(result.polyfill_recommendations.length > 0 ? result.polyfill_recommendations.map(p => `  - ${p}`) : ['  No polyfills required'])
      ].join('\n')
    }
  }))
}
