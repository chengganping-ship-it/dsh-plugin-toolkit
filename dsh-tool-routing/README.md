# dsh-tool-routing

> Multi-model intelligent routing plugin for DeepSeek Harness (DSH)

## Overview

**dsh-tool-routing** provides 8 intelligent routing tools for multi-model AI systems. It handles model selection, cost optimization, fallback strategies, load balancing, capability mapping, latency prediction, quality evaluation, and routing analytics — enabling you to build a robust, cost-effective, multi-model AI infrastructure.

## Installation

```bash
npm install @deepseek-ai/cordis @deepseek-ai/dsh-tools
npm install dsh-tool-routing
```

## Tools

### 1. model_selector
Selects the optimal AI model for a given task based on task type, constraints, cost, and quality requirements.

**Input:** `task_description`, `task_type` (code|chat|analysis|creative|vision), `constraints`
**Output:** Primary recommendation with confidence score, alternative models, risk assessment

### 2. cost_optimizer
Optimizes model selection for cost efficiency given task complexity, budget, and quality requirements.

**Input:** `task_complexity`, `budget_limit`, `quality_requirement`, `priority`
**Output:** Optimal model combination, token consumption estimate, cost breakdown, savings analysis

### 3. fallback_strategist
Designs multi-level fallback chains with switch triggers for high-availability model routing.

**Input:** `primary_model`, `failure_scenarios[]`, `sla_requirements`
**Output:** Multi-level fallback chain, switch triggers, estimated availability, worst-case latency

### 4. load_balancer
Distributes incoming requests across multiple models using configurable strategies.

**Input:** `models[]`, `current_loads[]`, `request_queue`, `strategy`
**Output:** Request assignments, load distribution, efficiency score, bottleneck warnings

### 5. capability_mapper
Maps required capabilities against available models and identifies coverage gaps.

**Input:** `required_capabilities[]`, `available_models[]`, `min_coverage_pct`
**Output:** Coverage matrix, recommended model combination, uncovered capabilities

### 6. latency_predictor
Predicts inference latency (TTFT, completion time, percentiles) for given configurations.

**Input:** `model_id`, `input_tokens`, `network_condition`, `output_token_estimate`
**Output:** TTFT, completion time, tokens/sec, P50/P95/P99 estimates, optimization suggestions

### 7. quality_evaluator
Evaluates and ranks model outputs across multiple weighted quality criteria.

**Input:** `model_outputs[]`, `evaluation_criteria[]`, `reference_answer?`
**Output:** Scored rankings, winner, score spread, cost-quality ratios

### 8. routing_analytics
Analyzes routing history to produce efficiency reports, cost trends, and optimization suggestions.

**Input:** `routing_history[]`, `time_range`, `granularity`
**Output:** Key metrics, model distribution, top/underperforming models, optimization suggestions

## Architecture

```
dsh-tool-routing/
  package.json        — NPM package manifest
  tsconfig.json       — TypeScript configuration
  cordis.yml          — Cordis plugin manifest
  src/
    index.ts          — All 8 tools + types + model registry
  lib/                — Compiled JS output (after build)
```

## Model Registry

The plugin ships with a built-in model registry covering popular models:

| Model | Provider | Cost (input $/1K) | Context |
|-------|----------|-------------------|---------|
| DeepSeek-V3 Chat | deepseek | $0.00027 | 64K |
| DeepSeek-V3 Coder | deepseek | $0.00027 | 64K |
| GPT-4o | openai | $0.005 | 128K |
| GPT-4o Mini | openai | $0.00015 | 128K |
| Claude Sonnet 4 | anthropic | $0.003 | 200K |
| Claude Haiku 4 | anthropic | $0.0008 | 200K |
| Gemini 2.5 Pro | google | $0.00125 | 1M |
| Llama 4 Maverick | meta | $0 (self-hosted) | 128K |
| Mistral Large | mistral | $0.002 | 128K |
| Command R+ | cohere | $0.0025 | 128K |

## Development

```bash
# Install dependencies
npm install

# Type-check (no emit)
npx tsc --noEmit

# Build
npx tsc
```

## Design Principles

1. **Deterministic outputs** — Uses seeded random (mulberry32) for reproducible results
2. **Rich reporting** — Every tool returns a markdown report alongside structured data
3. **Constraint-aware** — All tools respect cost, latency, and quality constraints
4. **Production-ready patterns** — SLA parameters, fallback chains, load balancing strategies

## License

MIT

## Author

chengganping-ship-it
