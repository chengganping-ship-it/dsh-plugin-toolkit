# DSH Cost Governance Layer

> Enterprise-grade cost visibility, budget enforcement, and optimization recommendations for running 186 DSH plugins at scale.

## The Problem

Gartner reports that **40% of AI Agent projects are cancelled due to cost overruns**, with typical spending of **$50-200 per user per month per agent**. Running 186 DSH plugins without cost governance is a recipe for uncontrolled spending.

## Solution

The DSH Cost Governance Layer provides:

| Capability | Description |
|-----------|-------------|
| **Budget Management** | Set monthly/quarterly budgets, enforce hard limits, per-user/per-plugin caps, rollover |
| **Cost Tracking** | Record every tool call with token estimates, per-plugin aggregation (186 plugins), time-series tracking |
| **Optimization Engine** | Identify top-10 expensive plugins, detect low-value calls, recommend batching/caching/downgrading |
| **Alerting** | Budget threshold alerts (80%/95%), anomaly detection, per-plugin anomalies, multi-channel delivery |
| **Dashboard** | Generate chart-ready JSON for time-series, per-plugin breakdown, top tools, KPIs |

## Architecture

```
+-------------------------------------------------------------+
|                    AI Agent / MCP Client                     |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                   DSH Cost Governance Layer                  |
|                                                             |
|  +--------------+  +-------------+  +-------------------+   |
|  | Budget        |  | Cost        |  | Optimizer         |   |
|  | Manager       |  | Tracker     |  | (Analysis Engine) |   |
|  |               |  |             |  |                   |   |
|  | - monthly cap |  | - per-call  |  | - top-10 plugins  |   |
|  | - per-user    |  | - per-plugin|  | - low-value detect|   |
|  | - per-plugin  |  | - time-span │  | - recommendations |   |
|  | - rollover    |  | - dedup     │  | - savings calc    |   |
|  +------+--------+  +------+------+  +---------+---------+   |
|         |                  |                    |             |
|         v                  v                    v             |
|  +-------------------------------------------------------+   |
|  |              Alerting System                           |   |
|  |  - threshold alerts (80%/95%)  - anomaly spike detect  |   |
|  |  - per-plugin anomaly         - console/file/webhook   |   |
|  +-------------------------------------------------------+   |
|         |                                                    |
|         v                                                    |
|  +-------------------------------------------------------+   |
|  |              Dashboard Generator                        |   |
|  |  - time-series JSON  - per-plugin charts  - KPIs        |   |
|  +-------------------------------------------------------+   |
+-------------------------------------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|              MCP Bridge (186 DSH Plugins / 1488 Tools)      |
+-------------------------------------------------------------+
```

## Quick Start

```typescript
import {
  BudgetManager,
  CostTracker,
  CostOptimizer,
  AlertingSystem,
  DashboardGenerator,
} from 'dsh-cost-governance';

// 1. Initialize components
const budget = new BudgetManager({
  monthlyBudgetUSD: 500,
  warningThreshold: 0.8,
  hardLimitThreshold: 1.0,
  perUserBudgetUSD: 50,
  perPluginBudgetUSD: 20,
});

const tracker = new CostTracker({
  inputCostPer1KTokens: 0.003,   // GPT-4o tier
  outputCostPer1KTokens: 0.015,
});

const alerting = new AlertingSystem({
  consoleEnabled: true,
  webhookUrl: 'https://alerts.company.com/cost',
});

// 2. Record a tool call
const record = tracker.record(
  JSON.stringify({ query: 'market analysis Q3' }),
  JSON.stringify({ result: '...' }),
  'dsh-tool-fintechagent',
  'analyze_market',
  'user-001',
  1250,    // latency ms
  true     // success
);

// 3. Track spend against budget
if (record) {
  budget.recordSpend(record.estimatedCostUSD, 'user', 'user-001');
  budget.recordSpend(record.estimatedCostUSD, 'plugin', 'dsh-tool-fintechagent');
}

// 4. Check budget status
const status = budget.getStatus();
console.log(`Budget: $${status.spentUSD} / $${status.monthlyBudgetUSD} (${(status.percentageUsed * 100).toFixed(1)}%)`);

// 5. Enforce limits before next call
if (!budget.isAllowed('user', 'user-001')) {
  console.error('Budget exceeded for user-001');
}

// 6. Generate optimization report
const optimizer = new CostOptimizer(tracker.getRecords());
const report = optimizer.generateReport(budget.getCurrentSpend());
console.log(CostOptimizer.formatSavings(report));

// 7. Generate dashboard data
const dashboard = new DashboardGenerator(tracker, budget, alerting);
const data = dashboard.generate('daily', 10);
console.log(dashboard.toJSON(data));

// 8. Export cost data
const json = tracker.export('json');
const csv = tracker.export('csv');
```

## Integration with MCP Bridge

The Cost Governance Layer integrates seamlessly with the existing MCP Bridge:

```typescript
// In mcp-bridge/src/index.ts (or tool-adapter.ts)
import { BudgetManager, CostTracker, AlertingSystem } from 'dsh-cost-governance';

// Wrap every tool call with cost tracking
async function executeWithCostGovernance(
  toolCall: { plugin: string; tool: string; input: string },
  userId: string
) {
  // Check budget before execution
  if (!budget.isAllowed('user', userId)) {
    throw new Error('Budget exceeded. Please retry next billing cycle.');
  }

  const startTime = Date.now();
  const result = await executeTool(toolCall);
  const latencyMs = Date.now() - startTime;

  // Record cost
  const record = tracker.record(
    toolCall.input,
    result.output,
    toolCall.plugin,
    toolCall.tool,
    userId,
    latencyMs,
    result.success,
    result.error
  );

  if (record) {
    budget.recordSpend(record.estimatedCostUSD, 'user', userId);
    budget.recordSpend(record.estimatedCostUSD, 'plugin', toolCall.plugin);
  }

  // Emit alerts on threshold crossings
  alerting.emitBudgetAlert(budget.getStatus());

  return result;
}
```

## Configuration

### Budget Configuration

```typescript
const budget = new BudgetManager({
  monthlyBudgetUSD: 1000,       // Monthly spend cap
  warningThreshold: 0.8,        // Alert at 80%
  hardLimitThreshold: 1.0,      // Block at 100%
  perUserBudgetUSD: 50,         // Per-user monthly cap
  perPluginBudgetUSD: 20,       // Per-plugin monthly cap
  rolloverEnabled: false,       // Carry unused budget forward
});
```

### Cost Tracker Configuration

```typescript
const tracker = new CostTracker({
  inputCostPer1KTokens: 0.003,  // $0.003 per 1K input tokens (GPT-4o)
  outputCostPer1KTokens: 0.015, // $0.015 per 1K output tokens
  charsPerToken: 4,             // Token estimation heuristic
  maxRecords: 100_000,          // Max in-memory records
  deduplicationWindowMs: 5_000, // 5s dedup window
});
```

### Model Pricing Reference

| Model | Input ($/1M) | Output ($/1M) |
|-------|-------------|---------------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Haiku 4 | $0.25 | $1.25 |
| Gemini 2.5 Pro | $1.25 | $5.00 |
| Gemini 2.5 Flash | $0.15 | $0.60 |
| DeepSeek V3 | $0.27 | $1.10 |
| DeepSeek R1 | $0.55 | $2.19 |

## API Reference

### BudgetManager

| Method | Description |
|--------|-------------|
| `setConfig(config)` | Update budget configuration |
| `setMonthlyBudget(usd)` | Set monthly budget cap |
| `setPerUserBudget(usd)` | Set per-user budget cap |
| `setPerPluginBudget(usd)` | Set per-plugin budget cap |
| `recordSpend(usd, type, id)` | Record spend for an entity |
| `getStatus()` | Get full budget status with projections |
| `isAllowed(type, id)` | Check if a call is allowed under budget |
| `getUserSpend(userId)` | Get user's current spend |
| `getPluginSpend(pluginName)` | Get plugin's current spend |
| `getEntitySpends()` | Get all entity spend summaries |
| `reset()` | Reset all budget data |

### CostTracker

| Method | Description |
|--------|-------------|
| `record(input, output, plugin, tool, userId, latencyMs, success)` | Record a tool call |
| `recordCachedHit(plugin, tool, userId)` | Record a cache hit |
| `getRecords()` | Get all call records |
| `getRecordsByPlugin(name)` | Filter by plugin |
| `getRecordsByUser(id)` | Filter by user |
| `getRecordsInRange(start, end)` | Filter by time range |
| `getTotalCost()` | Get total cost |
| `getTotalTokens()` | Get total token counts |
| `getTotalCalls()` | Get total call count |
| `getSuccessRate()` | Get success rate |
| `getCacheHitRate()` | Get cache hit rate |
| `getTimeSeries(granularity)` | Get time-series aggregation |
| `getPluginSummaries()` | Get per-plugin cost summaries |
| `export(format)` | Export as JSON or CSV |
| `reset()` | Reset all tracking data |

### CostOptimizer

| Method | Description |
|--------|-------------|
| `generateReport(monthlySpend)` | Generate full optimization report |
| `getTopExpensivePlugins(n)` | Identify top N expensive plugins |
| `analyzeLowValueCalls()` | Detect wasteful calls |
| `isEmptyResult(output)` | Check if result is empty |
| `formatSavings(report)` | Format report as readable string |

### AlertingSystem

| Method | Description |
|--------|-------------|
| `emit(alert)` | Emit a custom alert |
| `emitBudgetAlert(status)` | Emit budget threshold alert |
| `emitAnomalyAlert(cost, baseline, id)` | Emit cost spike alert |
| `emitPluginAnomaly(plugin, expected)` | Emit plugin anomaly alert |
| `emitEntityLimitAlert(id, type, spent, cap)` | Emit entity limit alert |
| `getAlerts()` | Get all alerts |
| `getRecentAlerts(n)` | Get recent N alerts |
| `getUnacknowledgedAlerts()` | Get unacknowledged alerts |
| `acknowledge(alertId)` | Acknowledge an alert |
| `addHandler(fn)` | Register custom alert handler |

### DashboardGenerator

| Method | Description |
|--------|-------------|
| `generate(granularity, topN)` | Generate complete dashboard dataset |
| `generateHeaderCards()` | Generate header KPI cards |
| `generateSpendByPluginChart()` | Generate pie chart data |
| `generateCostTimeSeriesChart(granularity)` | Generate time-series chart data |
| `generatePluginEfficiencyChart()` | Generate efficiency bar chart data |
| `toJSON(data, pretty)` | Serialize to JSON |

## Best Practices

1. **Set realistic monthly budgets** based on expected usage and team size. Start conservative; increase as you understand patterns.

2. **Use per-user budgets** in multi-tenant deployments to prevent one user from exhausting the entire budget.

3. **Enable rollover** for predictable workloads to maximize budget utilization.

4. **Run the optimizer weekly** to identify optimization opportunities. Apply high-impact, low-effort recommendations first.

5. **Set up webhook alerts** for critical threshold breaches to enable rapid response.

6. **Integrate the cost-awareness prompt** into all AI Agent system prompts to build cost consciousness from the start.

7. **Monitor the dashboard daily** for anomaly patterns that indicate bugs or abuse.

8. **Cache aggressively** — the tracker's dedup window eliminates duplicate calls, but explicit caching in your application is even more effective.

## License

MIT
