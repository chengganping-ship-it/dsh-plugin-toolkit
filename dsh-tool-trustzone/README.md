# dsh-tool-trustzone

> Agent Trust & Sandbox Management Plugin for DeepSeek Harness (DSH)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-green.svg)](https://github.com/deepseek-ai)

## Overview

`dsh-tool-trustzone` provides a comprehensive agent governance toolkit for DeepSeek Harness, implementing the 2026 "Agent Governance" paradigm: permission scoping, risk scoring, execution isolation, policy enforcement, trust chain validation, escape detection, resource quotas, and audit logging.

## Installation

```bash
npm install dsh-tool-trustzone
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `permission_scoper` | Defines minimal permission scope (least privilege) for an agent based on role, task type, and resources |
| 2 | `risk_scorer` | Scores operations 0-100 based on operation type, resource sensitivity, and agent clearance |
| 3 | `sandbox_configurator` | Generates sandbox configs (network, filesystem, syscalls, resource limits) tuned to risk level |
| 4 | `policy_enforcer` | Evaluates action requests against active policies with deny-overrides strategy |
| 5 | `trust_chain_validator` | Validates agent trust chain integrity against known trust anchors |
| 6 | `escape_detector` | Analyzes execution logs for sandbox escape attempts and anomalous behavior |
| 7 | `resource_quota_manager` | Monitors resource usage against quotas and provides throttling recommendations |
| 8 | `trust_audit_logger` | Generates structured audit logs and detects anomaly patterns |

## Quick Start

```typescript
import {
  permissionScoperTool,
  riskScorerTool,
  sandboxConfiguratorTool,
  policyEnforcerTool,
  trustChainValidatorTool,
  escapeDetectorTool,
  resourceQuotaManagerTool,
  trustAuditLoggerTool,
} from 'dsh-tool-trustzone';

// Score an operation risk
const riskResult = await riskScorerTool.execute({
  operation: 'delete',
  target_resource: { id: 'prod-db', type: 'database', sensitivity: 'secret' },
  agent_clearance_level: 'internal',
});
console.log(riskResult.risk_score); // e.g. 72
console.log(riskResult.requires_human_approval); // true

// Configure a sandbox
const sandbox = await sandboxConfiguratorTool.execute({
  task_risk_level: 'high',
  required_resources: [{ id: 'app-code', type: 'file', path: '/workspace' }],
  isolation_level: 'container',
});
console.log(sandbox.sandbox_config.resource_limits);
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  DSH Runtime                         │
├─────────────────────────────────────────────────────┤
│              dsh-tool-trustzone                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ Permission│ │  Risk    │ │    Sandbox       │    │
│  │  Scoper   │ │  Scorer  │ │  Configurator    │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │  Policy   │ │  Trust   │ │    Escape        │    │
│  │ Enforcer  │ │  Chain   │ │   Detector       │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Resource  │ │  Trust   │                          │
│  │  Quota    │ │  Audit   │                          │
│  └──────────┘ └──────────┘                          │
└─────────────────────────────────────────────────────┘
```

## Risk Scoring Model

The risk scorer uses a multi-factor model:

- **Operation base risk**: read (5) → privilege-escalation (90)
- **Resource type risk**: file (10) → secret (45)
- **Clearance mismatch**: +15 per level of insufficient clearance
- **Environmental jitter**: +/- 5 deterministic noise (seeded)

| Score Range | Level | Human Approval |
|-------------|-------|----------------|
| 80-100 | Critical | Required |
| 60-79 | High | Required |
| 40-59 | Medium | Recommended |
| 20-39 | Low | Not required |
| 0-19 | Minimal | Not required |

## Sandbox Isolation Tiers

| Tier | CPU | Memory | Network | Use Case |
|------|-----|--------|---------|----------|
| Process | 25-100% | 256-4096 MB | Conditional | Low-risk tasks |
| Container | 25-100% | 256-4096 MB | Conditional | Standard workloads |
| VM | 25-100% | 256-4096 MB | Conditional | High-risk / untrusted |

## License

MIT
