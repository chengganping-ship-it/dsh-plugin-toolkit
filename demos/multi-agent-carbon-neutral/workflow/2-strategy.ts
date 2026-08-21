/**
 * Phase 2: Reduction Strategy
 * Uses energy + manufacturing agents to design reduction roadmap
 */

import { EnergyAgent } from '../agents/energy-agent.js'
import { ManufacturingAgent } from '../agents/manufacturing-agent.js'

export async function runStrategyPhase(): Promise<string> {
  const energy = new EnergyAgent()
  const mfg = new ManufacturingAgent()

  console.log('⚡ [Phase 2] Designing reduction strategy...')

  const [solar, efficiency, process] = await Promise.all([
    energy.execute('solar_rooftop_assessment', { roof_area: 45000, location: 'shanghai' }),
    energy.execute('energy_efficiency_audit', { current_pue: 1.62, target_pue: 1.35 }),
    mfg.execute('process_optimization', { process: 'die_casting', annual_output: 500000 })
  ])

  return `## Phase 2: 减排策略设计

### ${energy.id} — 可再生能源
${solar.output}

### ${energy.id} — 能效提升
${efficiency.output}

### ${mfg.id} — 工艺优化
${process.output}

---
**Phase 2 Token Estimate**: ${solar.tokenEstimate + efficiency.tokenEstimate + process.tokenEstimate} tokens
**Phase 2 Duration**: ${solar.durationMs + efficiency.durationMs + process.durationMs}ms
`
}
