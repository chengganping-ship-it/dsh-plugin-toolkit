# dsh-tool-browserforge

**Browser Automation Engine for DeepSeek Harness**

Version: 0.1.0 | License: MIT | Author: chengganping-ship-it

## Overview

DSH Browser Forge is a comprehensive browser automation plugin for DeepSeek Harness, providing web testing, screenshots, form filling, data extraction, accessibility testing, performance profiling, and cross-browser compatibility planning. Designed as the DSH equivalent of Playwright Skill (one of the most popular Claude Code skills).

## Features

### 8 Browser Automation Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `test_script_generator` | Generate runnable Playwright/Puppeteer/Cypress/Selenium test scripts from scenario definitions with coverage analysis and risk assessment |
| 2 | `selector_advisor` | Recommend optimal CSS/XPath/ARIA selectors with stability scoring, anti-pattern detection, and fallback suggestions |
| 3 | `screenshot_planner` | Plan viewport-aware screenshot strategies with interaction checkpoints, Mermaid flow diagrams, and CI integration tips |
| 4 | `form_fill_designer` | Design form fill scripts covering valid, boundary, invalid, SQL injection, XSS, fuzz, and realistic data strategies |
| 5 | `data_extraction_planner` | Plan web data extraction with selector mapping, pagination handling, multiple framework scripts, and ethical guidelines |
| 6 | `accessibility_tester` | Generate WCAG compliance test scripts (axe-core, Lighthouse) with violation checklists and remediation guidance |
| 7 | `performance_profiler` | Generate Core Web Vitals test scripts with metric thresholds, per-URL baselines, and optimization hints |
| 8 | `cross_browser_planner` | Generate cross-browser compatibility matrices with test priorities, risk areas, and polyfill recommendations |

## Installation

```bash
cd dsh-tool-browserforge
npm install
npx tsc --noEmit  # Type-check without emitting
```

## Project Structure

```
dsh-tool-browserforge/
├── package.json          # NPM package configuration
├── tsconfig.json         # TypeScript configuration (ES2022, ESNext modules)
├── cordis.yml            # DSH plugin manifest (8 tools registered)
├── README.md             # This file
├── src/
│   └── index.ts          # Core implementation (8 tools, strict TypeScript)
└── lib/                  # Compiled output directory
```

## Architecture

### Design Principles

1. **Strict TypeScript**: All interfaces explicitly typed, no `any` in public APIs
2. **Deterministic Output**: Uses `seededRandom` for reproducible results from input seeds
3. **Markdown Reports**: All tools produce rich markdown reports with emoji indicators and tables
4. **Security-First**: Form designer includes SQL injection/XSS/fuzz testing by default
5. **Ethics-Aware**: Data extraction planner includes robots.txt and rate-limit reminders
6. **CI-Ready**: Generated scripts are immediately runnable in CI environments

### Tool Input/Output

| Tool | Input | Output |
|------|-------|--------|
| test_script_generator | scenarios[], browsers[], framework | Runnable test code, coverage report |
| selector_advisor | page description, element hints | Ranked selectors with scores, anti-patterns |
| screenshot_planner | URL, viewports[], steps[] | Checkpoint plan, flow diagram, storage estimate |
| form_fill_designer | form schema, strategy, rules | Fill scripts, boundary cases, security notes |
| data_extraction_planner | URL, field schema[], pagination | Extraction scripts, selector map, ethical notes |
| accessibility_tester | elements[], WCAG level | Violation list, compliance score, a11y scripts |
| performance_profiler | URLs[], metrics[], config | Test script, thresholds, optimization hints |
| cross_browser_planner | browsers[], features[] | Compatibility matrix, risk areas, polyfills |

### Framework Support

- **Playwright** (recommended): Full-featured, multi-browser, best for modern web apps
- **Puppeteer**: Chrome-only, lightweight, great for PDF/screenshot automation
- **Cypress**: Best for component testing and frontend-heavy applications
- **Selenium**: Legacy support, widest language/browser compatibility

## Usage Example

```typescript
// In DSH agent context, call tools directly:
const result = await ctx.tools.execute('test_script_generator', {
  test_scenarios: [
    {
      name: 'Login Flow',
      steps: [
        { action: 'navigate', target: '/login' },
        { action: 'fill', target: '#email', value: 'test@example.com' },
        { action: 'fill', target: '#password', value: 'secret' },
        { action: 'click', target: "button[type='submit']" },
        { action: 'assert', target: '.dashboard' }
      ],
      expected_result: 'User sees dashboard'
    }
  ],
  browser_targets: ['chromium', 'firefox'],
  framework: 'playwright'
})
```

## License

MIT
