# Multi-Agent Carbon Neutrality Orchestration Demo

**L4 Collaborative Intelligence — 5 DSH plugins working together**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  MultiAgentOrchestrator                       │
│                  (L4 主从式编排引擎)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1: Assessment     Phase 2: Strategy                   │
│  ┌───────────────────┐  ┌───────────────────┐               │
│  │ CarbonTradingAgent│  │ EnergyAgent        │               │
│  │ ManufacturingAgent│  │ ManufacturingAgent │               │
│  │ EcoAgent          │  │                     │               │
│  └───────────────────┘  └───────────────────┘               │
│                                                               │
│  Phase 3: Trading        Phase 4: Roadmap                   │
│  ┌───────────────────┐  ┌───────────────────┐               │
│  │ CarbonTradingAgent│  │ FinanceAgent       │               │
│  └───────────────────┘  └───────────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 5 Orchestrated Agents

| Agent | Plugin | Role | Tools Used |
|-------|--------|------|------------|
| Carbon Trading | carbontradingagent | 碳市场分析、合规、路径规划 | compliance_gap_analyzer, carbon_price_predictor, carbon_neutrality_roadmap |
| Energy | energyagentpro | 可再生能源、能效审计 | solar_rooftop_assessment, energy_efficiency_audit |
| Manufacturing | manufacturingagent | 工艺碳足迹、节能改造 | carbon_footprint_assessment, process_optimization |
| Ecology | ecoagentpro | 碳汇评估、生态修复 | carbon_sink_assessment |
| Finance | wealthagentpro | 绿色投资ROI、融资策略 | green_investment_roi, financing_strategy, esg_valuation_impact |

## 4-Phase Workflow

1. **Assessment** → Baseline碳基线 (compliance + footprint + sink)
2. **Strategy** → 减排策略 (solar + efficiency + process optimization)
3. **Trading** → 碳信用方案 (price forecast + neutrality roadmap)
4. **Roadmap** → 实施路线 (ROI + financing + ESG impact)

## Run

```bash
cd demos/multi-agent-carbon-neutral
npm install
npx tsx orchestrator.ts
```

## Output

Final neutrality plan reports:
- `baseline-report.md` — Phase 1 碳基线
- `strategy-report.md` — Phase 2 减排策略
- `trading-report.md` — Phase 3 信用交易
- `roadmap-report.md` — Phase 4 实施路线
- `neutrality-plan.md` — Final consolidated plan

---

*Part of DSH Plugin Toolkit — 186 plugins | 1488 tools*
*Uses L4 Multi-Agent Orchestration (2026 production standard)*
