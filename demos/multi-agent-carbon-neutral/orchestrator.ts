/**
 * ═══════════════════════════════════════════════════════════════════════════
 * L4 Multi-Agent Orchestrator — Carbon Neutrality Planning Demo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Demonstrates L4 (Collaborative Intelligence) by orchestrating 5 DSH plugins:
 *   1. carbontradingagent  — Carbon market analysis & price forecasts
 *   2. energyagentpro     — Energy audit & renewables potential
 *   3. manufacturingagent — Manufacturing process emissions assessment
 *   4. ecoagentpro        — Carbon sink potential calculation
 *   5. wealthagentpro     — Financial modeling for green investment ROI
 *
 * @module orchestrator
 * @version 1.0.0
 */

import { runAssessmentPhase } from './workflow/1-assessment.js'
import { runStrategyPhase } from './workflow/2-strategy.js'
import { runTradingPhase } from './workflow/3-trading.js'
import { runRoadmapPhase } from './workflow/4-roadmap.js'

// ═══════════════════════════════════════════════════════════════════════════
// AGENT REGISTRY — 5 orchestrated plugins
// ═══════════════════════════════════════════════════════════════════════════

interface AgentMeta {
  id: string
  displayName: string
  color: string
}

const AGENTS: Record<string, AgentMeta> = {
  carbontradingagent: { id: 'carbontradingagent', displayName: 'Carbon Trading Agent', color: '#10B981' },
  energyagentpro:     { id: 'energyagentpro',     displayName: 'Energy Agent Pro',     color: '#3B82F6' },
  manufacturingagent: { id: 'manufacturingagent', displayName: 'Manufacturing Agent', color: '#F59E0B' },
  ecoagentpro:        { id: 'ecoagentpro',        displayName: 'Eco Agent Pro',       color: '#22C55E' },
  wealthagentpro:     { id: 'wealthagentpro',     displayName: 'Wealth Agent Pro',    color: '#8B5CF6' },
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — Run the full 4-phase carbon neutrality workflow
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const planStart = Date.now()

  console.log('')
  console.log('╔══════════════════════════════════════════════════════════════════════════╗')
  console.log('║   L4 MULTI-AGENT ORCHESTRATION — Carbon Neutrality Planning Demo       ║')
  console.log('║   5 DSH Plugins Collaborating via 4-Phase Sequential Workflow          ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════╝')
  console.log('')

  // ═══ PHASE 1: Baseline Emissions Assessment ═══
  console.log('┌─────────────────────────────────────────────────────────────────────────┐')
  console.log('│  PHASE 1/4 — Baseline Emissions Assessment                              │')
  console.log('│  Agents: carbontradingagent, manufacturingagent, ecoagentpro            │')
  console.log('└─────────────────────────────────────────────────────────────────────────┘')
  const t1 = Date.now()
  const phase1 = await runAssessmentPhase()
  const d1 = Date.now() - t1
  console.log(`  Duration: ${d1}ms`)
  console.log(phase1)

  // ═══ PHASE 2: Reduction Strategy ═══
  console.log('')
  console.log('┌─────────────────────────────────────────────────────────────────────────┐')
  console.log('│  PHASE 2/4 — Reduction Strategy Development                             │')
  console.log('│  Agents: energyagentpro, manufacturingagent                             │')
  console.log('└─────────────────────────────────────────────────────────────────────────┘')
  const t2 = Date.now()
  const phase2 = await runStrategyPhase()
  const d2 = Date.now() - t2
  console.log(`  Duration: ${d2}ms`)
  console.log(phase2)

  // ═══ PHASE 3: Carbon Credit Trading ═══
  console.log('')
  console.log('┌─────────────────────────────────────────────────────────────────────────┐')
  console.log('│  PHASE 3/4 — Carbon Credit Trading Plan                                 │')
  console.log('│  Agents: carbontradingagent                                             │')
  console.log('└─────────────────────────────────────────────────────────────────────────┘')
  const t3 = Date.now()
  const phase3 = await runTradingPhase()
  const d3 = Date.now() - t3
  console.log(`  Duration: ${d3}ms`)
  console.log(phase3)

  // ═══ PHASE 4: Implementation Roadmap ═══
  console.log('')
  console.log('┌─────────────────────────────────────────────────────────────────────────┐')
  console.log('│  PHASE 4/4 — Implementation Roadmap                                     │')
  console.log('│  Agents: wealthagentpro                                                 │')
  console.log('└─────────────────────────────────────────────────────────────────────────┘')
  const t4 = Date.now()
  const phase4 = await runRoadmapPhase()
  const d4 = Date.now() - t4
  console.log(`  Duration: ${d4}ms`)
  console.log(phase4)

  // ═══ CONSOLIDATED REPORT ═══
  const totalDuration = Date.now() - planStart
  const report = generateReport(
    [{ name: 'Baseline Assessment', output: phase1, duration: d1 },
     { name: 'Reduction Strategy', output: phase2, duration: d2 },
     { name: 'Carbon Trading Plan', output: phase3, duration: d3 },
     { name: 'Implementation Roadmap', output: phase4, duration: d4 }],
    totalDuration
  )

  console.log('')
  console.log('╔══════════════════════════════════════════════════════════════════════════╗')
  console.log('║                    CONSOLIDATED CARBON NEUTRALITY PLAN                  ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(report)

  // Write report
  const { writeFile } = await import('node:fs/promises')
  await writeFile(
    new URL('./neutrality-plan.md', import.meta.url),
    report,
    'utf-8'
  )
  console.log('  [OUTPUT] Plan written to: neutrality-plan.md')
  console.log('')

  return report
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

interface PhaseResult {
  name: string
  output: string
  duration: number
}

function generateReport(phases: PhaseResult[], totalDuration: number): string {
  const lines: string[] = []

  lines.push('# Carbon Neutrality Strategic Plan')
  lines.push('')
  lines.push('> **Generated by:** L4 Multi-Agent Orchestration — DSH Plugin Toolkit Demo')
  lines.push(`> **Generated at:** ${new Date().toISOString()}`)
  lines.push(`> **Total duration:** ${totalDuration}ms | **Phases:** ${phases.length}`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Executive Summary')
  lines.push('')
  lines.push('This carbon neutrality strategic plan was generated through collaborative orchestration of 5 DSH AI agent plugins, each contributing specialized domain expertise. The agents executed in a 4-phase sequential workflow, with each phase building upon insights from the previous.')
  lines.push('')

  lines.push('### Agents Orchestrated')
  lines.push('')
  lines.push('| # | Agent | Role | Color |')
  lines.push('|---|-------|------|-------|')
  lines.push('| 1 | **carbontradingagent** | Carbon market analysis & compliance | 🟢 |')
  lines.push('| 2 | **energyagentpro** | Energy audit & renewables assessment | 🔵 |')
  lines.push('| 3 | **manufacturingagent** | Process emissions & sustainability | 🟡 |')
  lines.push('| 4 | **ecoagentpro** | Carbon sink & environmental assessment | 🟢 |')
  lines.push('| 5 | **wealthagentpro** | Financial modeling for green investment | 🟣 |')
  lines.push('')

  for (let i = 0; i < phases.length; i++) {
    const p = phases[i]
    lines.push(`## Phase ${i + 1}: ${p.name}`)
    lines.push('')
    lines.push(`**Duration:** ${p.duration}ms`)
    lines.push('')
    lines.push(p.output)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Execution Statistics')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Duration | ${totalDuration}ms |`)
  lines.push(`| Workflow Phases | ${phases.length} |`)
  for (const p of phases) {
    lines.push(`| ${p.name} | ${p.duration}ms |`)
  }
  lines.push('')

  lines.push('## Conclusion')
  lines.push('')
  lines.push('This plan demonstrates L4 Collaborative Intelligence — the ability of multiple specialized AI agents to orchestrate their capabilities in a structured workflow, with each agent building upon the outputs of others to produce a comprehensive carbon neutrality strategy.')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*Generated by DSH Plugin Toolkit — Multi-Agent Carbon Neutrality Demo v1.0.0*')

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

main().catch((err: Error) => {
  console.error('  [ERROR] Orchestrator failed:', err.message)
  process.exit(1)
})
