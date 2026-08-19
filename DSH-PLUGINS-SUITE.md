# DSH Plugin Suite — Divergent Innovation Collection

> **5 New Plugin Categories | 40 Tools | Zero Code Review**
>
> A complete departure from conventional code analysis plugins. Each plugin targets a distinct domain with unique technologies, data structures, and decision frameworks.

---

## Overview

| Plugin | Domain | Tools | Purpose |
|--------|--------|-------|---------|
| `dsh-tool-cryptosignal` | Crypto Arbitrage | 8 | Cross-exchange funding rate arbitrage, whale tracking, liquidation analysis |
| `dsh-tool-regulator` | Regulatory Compliance | 8 | Cross-border policy monitoring, sanctions screening, tariff calculation |
| `dsh-tool-ecomintel` | E-commerce Intelligence | 8 | Competitor pricing, review sentiment, market share analysis |
| `dsh-tool-agentcoord` | Multi-Agent Orchestration | 8 | Task decomposition, agent matching, consensus mechanisms |
| `dsh-tool-supplyrisk` | Supply Chain Risk | 8 | Supplier health, geopolitical risk, disruption early warning |

---

## Plugin 1: Crypto Arbitrage Signal Engine (`dsh-tool-cryptosignal`)

**Purpose:** Detect and score cryptocurrency arbitrage opportunities across centralized exchanges.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `funding_rate_analyzer` | Exchange funding rate data (JSON) | Cross-exchange funding spread opportunities with APR |
| `cross_exchange_spread` | Price data from multiple exchanges (JSON) | Profitable spread opportunities after fees |
| `whale_movement_tracker` | Large transaction data (JSON) | Accumulation/distribution signals |
| `liquidation_heatmap` | Liquidation level data (JSON) | Price magnet identification and cascade risk |
| `volatility_regime` | IV/RV metrics (JSON) | Regime classification and options strategy |
| `basis_spread_monitor` | Futures/spot basis data (JSON) | Cash-and-carry arbitrage yields |
| `arbitrage_opportunity_scorer` | Multi-factor opportunity data (JSON) | Composite scored rankings |
| `historical_funding_backtest` | Historical funding rates (JSON) | Sharpe, drawdown, win rate analysis |

### Key Algorithms
- Funding rate APR annualization with interval normalization
- Liquidation cluster density scoring with magnet risk assessment
- Multi-factor opportunity scoring (spread, volume, stability, funding, competition)
- Historical backtest with Sharpe ratio and max drawdown calculation

---

## Plugin 2: Cross-Border Regulatory Radar (`dsh-tool-regulator`)

**Purpose:** Monitor regulatory changes, assess compliance gaps, and calculate trade policy impacts.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `policy_change_detector` | Policy documents (JSON) | Detected changes with impact assessment |
| `compliance_gap_analyzer` | Current practices vs requirements (JSON) | Gap analysis with remediation steps |
| `sanctions_screening` | Entity list (JSON) | Match results with confidence scores |
| `tariff_impact_calculator` | Product shipping data (JSON) | Landed cost with tariff breakdown |
| `license_requirement_checker` | Business activities (JSON) | Required licenses with application process |
| `regulatory_deadline_tracker` | Compliance obligations (JSON) | Deadline urgency with action items |
| `cross_border_risk_scorer` | Transaction data (JSON) | Risk scores with mitigation recommendations |
| `regulation_summarizer` | Regulatory text (string) | Structured summary with key obligations |

### Key Algorithms
- Multi-jurisdiction risk scoring matrix
- Tariff cascade calculation (MFN + preferential + anti-dumping)
- Sanctions list fuzzy matching with entity resolution
- Deadline urgency classification with business day awareness

---

## Plugin 3: E-commerce Competitor Intelligence (`dsh-tool-ecomintel`)

**Purpose:** Monitor competitor pricing, analyze product reviews, and forecast market trends.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `competitor_price_tracker` | Price history data (JSON) | Price change trends and war alerts |
| `product_review_analyzer` | Review data (JSON) | Sentiment scores and theme extraction |
| `keyword_ranking_monitor` | Ranking data (JSON) | Rank changes and opportunity identification |
| `listing_quality_scorer` | Listing attributes (JSON) | Quality grades with improvement recommendations |
| `trend_forecaster` | Category trend data (JSON) | Growth forecasts with seasonality |
| `ad_spend_estimator` | Ad performance data (JSON) | Spend estimates with channel breakdown |
| `market_share_analyzer` | Market data (JSON) | Share distribution and concentration metrics |
| `pricing_strategy_advisor` | Cost and competition data (JSON) | Optimal pricing with profit projections |

### Key Algorithms
- Price trend classification (aggressive/moderate/stable)
- Review sentiment scoring with theme clustering
- Listing quality multi-factor grading (A-F)
- Market concentration (HHI) calculation

---

## Plugin 4: Multi-Agent Orchestration Coordinator (`dsh-tool-agentcoord`)

**Purpose:** Coordinate multiple AI agents working on complex tasks with dependency management and consensus.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `task_decomposer` | Task description (string) | Subtask tree with dependencies |
| `agent_capability_matcher` | Agent and task data (JSON) | Optimal assignments with confidence |
| `dependency_graph_builder` | Task dependency data (JSON) | Critical path and bottleneck identification |
| `consensus_mechanism_designer` | Coordination parameters (JSON) | Consensus protocol with voting rules |
| `conflict_resolver` | Conflict data (JSON) | Resolution recommendations with fairness scores |
| `progress_aggregator` | Agent status data (JSON) | Overall progress with bottleneck detection |
| `communication_optimizer` | Communication metrics (JSON) | Efficiency analysis with optimization suggestions |
| `coordination_health_monitor` | Health metrics (JSON) | Health dashboard with alerts |

### Key Algorithms
- Critical Path Method (CPM) for dependency analysis
- Topological sort with cycle detection
- Multi-dimensional capability matching with load balancing
- Consensus protocol design (supermajority, ranked choice, unanimity)

---

## Plugin 5: Supply Chain Risk Early Warning (`dsh-tool-supplyrisk`)

**Purpose:** Monitor supplier health, map geopolitical risks, and predict supply chain disruptions.

### Tools

| Tool | Input | Output |
|------|-------|--------|
| `supplier_health_scorer` | Supplier financial/operational data (JSON) | Health scores with risk flags |
| `geopolitical_risk_mapper` | Regional risk data (JSON) | Risk heat map with mitigation strategies |
| `disruption_early_warning` | Risk indicators (JSON) | Warning levels with recommended actions |
| `alternative_supplier_finder` | Requirements and current suppliers (JSON) | Ranked alternatives with switching costs |
| `logistics_bottleneck_detector` | Logistics performance data (JSON) | Bottleneck analysis with alternatives |
| `cost_volatility_tracker` | Input cost data (JSON) | Volatility metrics with hedging recommendations |
| `single_source_detector` | Sourcing data (JSON) | Single-source risk with diversification plans |
| `supply_chain_resilience_scorer` | Resilience dimensions (JSON) | Resilience score with improvement roadmap |

### Key Algorithms
- Multi-dimensional health scoring (financial + operational + relational)
- Geopolitical risk composite index
- Disruption probability-impact matrix
- Resilience scoring across 5 dimensions (redundancy, flexibility, visibility, collaboration, recovery)

---

## Technical Architecture

### DSH Plugin Pattern
All plugins follow the DeepSeek Harness "Everything is a Plugin" architecture:

```typescript
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'plugin-name'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'tool_name',
    description: '...',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON input...' },
      optional_param: { type: 'string', description: 'Optional...' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string; optional_param?: string }) {
      const data = JSON.parse(args.input_data)
      const result = analyzeData(data)
      return formatReport(result)
    }
  }))
}
```

### Design Principles
1. **JSON-over-string** — Complex data passed as JSON strings for DSH compatibility
2. **Pure analysis functions** — `analyzeXxx()` functions are side-effect free
3. **Formatted reports** — `formatXxxReport()` returns markdown for human readability
4. **Type-safe** — Full TypeScript interfaces for all data structures
5. **Zero external APIs** — All analysis runs locally (no API keys required)

---

## Installation

Each plugin is independent. Install individually:

```bash
cd dsh-tool-cryptosignal
npm install
npm run build
```

Or install all at once:

```bash
for plugin in dsh-tool-cryptosignal dsh-tool-regulator dsh-tool-ecomintel dsh-tool-agentcoord dsh-tool-supplyrisk; do
  cd $plugin && npm install && npm run build && cd ..
done
```

---

## Version Info

- **Suite Version:** 1.0.0
- **Release Date:** 2026-08-18
- **DSH Compatibility:** DeepSeek Harness v4.x+
- **License:** MIT
- **Author:** chengganping-ship-it
