# dsh-tool-automode

> Auto Mode Safety Classifier Plugin for DeepSeek Harness (DSH)

Inspired by Claude Code's auto mode (August 2026), this plugin provides intelligent command risk assessment, auto-approval workflows, and execution boundary enforcement for AI agent operations.

## Features

### 8 Safety Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `command_classifier` | Classify commands into safe/review/dangerous with confidence scoring |
| 2 | `risk_assessor` | Composite risk scoring (0-100) with factor decomposition |
| 3 | `boundary_enforcer` | Allow/deny/conditional decisions with violation detail |
| 4 | `approval_recommender` | Auto-approve/review/escalate recommendations |
| 5 | `execution_monitor` | Real-time anomaly detection and deviation alerts |
| 6 | `safety_auditor` | Compliance reporting and violation pattern analysis |
| 7 | `policy_tuner` | Policy optimization and threshold adjustment |
| 8 | `incident_predictor` | Potential incident prediction and prevention |

## Installation

```bash
npm install
```

## Build

```bash
npx tsc --noEmit   # Type-check only
npx tsc            # Compile to lib/
```

## Usage

Register with DSH via cordis.yml:

```yaml
- id: dsh-tool-automode
  name: dsh-tool-automode
  version: 0.1.0
  description: Auto mode safety - command classification, auto-approval, boundary enforcement
  author: chengganping-ship-it
  tools:
    - command_classifier
    - risk_assessor
    - boundary_enforcer
    - approval_recommender
    - execution_monitor
    - safety_auditor
    - policy_tuner
    - incident_predictor
```

## Tool Reference

### command_classifier

Classifies a command by risk level based on pattern matching, context analysis, and workspace scope.

**Input:** `classify_input` (JSON)
```json
{
  "command": "git push --force origin main",
  "context": "production deployment",
  "workspace_scope": "infrastructure"
}
```

**Output:** Risk level (safe/review/dangerous), confidence score, reasoning, category, auto-approve eligibility.

### risk_assessor

Computes a composite risk score (0-100) for proposed actions considering impact scope, data sensitivity, environment, and user clearance.

**Input:** `proposed_actions` (JSON array), `environment_context` (JSON), `user_clearance` (JSON)

**Output:** Overall risk score, risk level, factor decomposition, mitigations.

### boundary_enforcer

Enforces defined boundaries on action requests. Supports execution blocks, write limits, data scopes, rate limits, and read-only mode.

**Input:** `action_request` (JSON), `boundaries` (JSON array), `current_state` (JSON)

**Output:** Decision (allow/deny/conditional), violations, conditions.

### approval_recommender

Recommends approval actions based on risk thresholds and historical decision outcomes.

**Input:** `pending_actions` (JSON array), `risk_threshold` (number), `historical_decisions` (JSON array)

**Output:** Per-action recommendations (auto_approve/review/escalate) with confidence and SLA.

### execution_monitor

Monitors active operations for duration exceedance, resource spikes, unexpected side effects, and cascade failures.

**Input:** `active_operations` (JSON array), `expected_behavior` (JSON)

**Output:** Anomaly detections, health status, alert summary.

### safety_auditor

Audits execution logs against safety policies. Identifies violations and analyzes patterns.

**Input:** `execution_logs` (JSON array), `safety_policies` (JSON array)

**Output:** Compliance violations, compliance rate, risk distribution, violation patterns.

### policy_tuner

Analyzes false positive/negative logs to recommend policy threshold adjustments and rule changes.

**Input:** `false_positive_log` (JSON array), `false_negative_log` (JSON array), `current_policies` (JSON array)

**Output:** Tuning recommendations with expected improvements and confidence scores.

### incident_predictor

Predicts potential incidents from operation sequences considering system state, dependencies, and resource projections.

**Input:** `operation_sequence` (JSON array), `system_state` (JSON)

**Output:** Incident predictions with probability, severity, preventive measures, and impact estimates.

## Architecture

```
dsh-tool-automode/
├── package.json          # NPM package config
├── tsconfig.json         # TypeScript configuration
├── cordis.yml            # DSH plugin manifest
├── src/
│   └── index.ts          # Core plugin (8 tools, ~1400 lines)
├── lib/                  # Compiled output (after tsc)
└── README.md             # This file
```

## License

MIT

## Author

chengganping-ship-it
