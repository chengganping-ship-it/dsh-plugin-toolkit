# dsh-tool-auditor

**Agent Behavior Audit & Compliance Plugin for DeepSeek Harness**

Version: 0.1.0 | License: MIT | Author: chengganping-ship-it

## Overview

DSH Agent Auditor provides comprehensive agent behavior auditing, compliance checking, and forensic analysis capabilities for AI agent governance. Designed for the 2026 Agent Governance trend, it delivers operational traceability, anomaly detection, and regulatory compliance validation.

## Features

### 8 Audit Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `action_logger` | Structured audit log entry generation with severity classification, compliance relevance tagging, retention policy assignment, and hash chain integrity |
| 2 | `anomaly_detector` | Behavioral deviation detection comparing action history against baseline profiles with deviation scoring and multi-dimensional anomaly alerts |
| 3 | `compliance_checker` | Policy compliance validation checking forbidden actions/targets, excessive data access, and missing approvals with violation reporting |
| 4 | `forensics_analyzer` | Digital forensics with event timeline reconstruction, root cause identification, impact assessment, and remediation recommendations |
| 5 | `behavior_profiler` | Agent behavior pattern analysis identifying preferences, risk appetite, automation tendencies, and behavioral archetype classification |
| 6 | `policy_violation_scanner` | Real-time policy enforcement scanning with multiple rule matching strategies, risk scoring, and prioritized findings |
| 7 | `audit_report_generator` | Comprehensive audit report generation with executive summary, severity grading, compliance scoring (0-100), and letter-grade assessment |
| 8 | `trajectory_replayer` | Session trajectory replay with decision-point analysis, alternative evaluation, critical decision flagging, and optimization suggestions |

## Installation

```bash
cd dsh-tool-auditor
npm install
npx tsc --noEmit  # Type-check without emitting
```

## Project Structure

```
dsh-tool-auditor/
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

- **Strict TypeScript**: All interfaces explicitly typed, no `any` types
- **Deterministic Output**: Seeded random number generation for reproducible results
- **Markdown Reports**: All tools return structured markdown with emoji indicators
- **Template Literal Tables**: Table rows built via `.push()` with single-quote template literals
- **Zero External Runtime Dependencies**: Pure computation, no network calls

### Tool Data Flow

```
Input JSON → Parse & Validate → Core Logic → Format Markdown → Return Report
```

Each tool follows a consistent pattern:
1. Accept JSON string input via tool parameters
2. Parse into strongly-typed TypeScript interfaces
3. Execute analysis logic with deterministic algorithms
4. Format results as structured markdown with tables and severity indicators
5. Return formatted report string

### Severity Classification

All tools use a unified severity taxonomy:

| Level | Indicator | Description |
|-------|-----------|-------------|
| CRITICAL | [CRITICAL] | Immediate action required, potential compliance breach |
| HIGH | [HIGH] | Significant deviation, investigation recommended |
| MEDIUM | [MEDIUM] | Notable anomaly, monitoring required |
| LOW | [LOW] | Minor deviation, informational |
| INFO | [INFO] | Routine operation, no action needed |

## Usage Examples

### Action Logger

```json
{
  "log_input": "{\"agent_id\":\"agent-001\",\"action\":\"delete_database\",\"target\":\"prod-db-users\",\"result\":\"success\",\"timestamp\":\"2024-01-15T10:30:00Z\"}"
}
```

### Anomaly Detector

```json
{
  "action_history": "[{\"action\":\"read_file\",\"timestamp\":\"2024-01-15T10:00:00Z\",\"duration_ms\":120,\"success\":true}]",
  "baseline_profile": "{\"avg_actions_per_hour\":50,\"avg_duration_ms\":200,\"success_rate\":0.95,\"common_actions\":[\"read_file\",\"write_file\"],\"risk_tolerance\":\"medium\"}"
}
```

### Compliance Checker

```json
{
  "actions": "[{\"action\":\"export_data\",\"target\":\"customer_db\",\"data_accessed\":[\"PII\",\"financial\"],\"timestamp\":\"2024-01-15T10:00:00Z\",\"agent_id\":\"agent-001\"}]",
  "policies": "[{\"policy_id\":\"POL-001\",\"name\":\"Data Protection\",\"description\":\"Prevents unauthorized data export\",\"forbidden_actions\":[\"export\",\"delete\"],\"forbidden_targets\":[\"production\"],\"required_approval_above\":[\"customer_db\"],\"max_data_types\":3}]"
}
```

## Compliance Frameworks Supported

- **GDPR**: Data access tracking, retention policy enforcement, PII handling audit
- **SOX**: Financial system access logging, change management tracking
- **HIPAA**: Healthcare data access monitoring, audit trail maintenance
- **SOC 2**: Security control monitoring, anomaly detection, access review
- **ISO 27001**: Information security event logging, risk assessment support

## Development

### Build

```bash
npx tsc
```

### Type Check Only

```bash
npx tsc --noEmit
```

### Adding New Tools

1. Define input/output interfaces in the Types section
2. Implement core logic function
3. Implement markdown formatter function
4. Register tool in the `apply()` function with `tools.register(defineTool({...}))`
5. Update `cordis.yml` with the new tool name

## Version History

- **v0.1.0** (2024-01): Initial release with 8 audit tools

## License

MIT License - see package.json for details.
