# DSH Enterprise ERP Automation Agent (dsh-tool-erpagent)

**Version:** 0.1.0 | **License:** MIT | **Author:** chengganping-ship-it

Enterprise-grade ERP automation toolkit for DeepSeek Harness Agent. Designed for finance teams, auditors, compliance officers, and operations managers navigating the journey from demo to real-world Agent impact.

## Overview

dsh-tool-erpagent delivers production-oriented ERP automation capabilities across the full financial operations lifecycle. From period-end close to compliance screening, from contract lifecycle management to intelligent approval routing, this plugin equips AI agents with structured, auditable tools that produce real business value.

**Trend Alignment: "Agent from Demo to Real Impact"** — This tool bridges the gap between AI proof-of-concepts and production systems by providing explainable outputs, adjustment recommendations, and actionable remediation plans that finance teams can trust and act upon.

## Features

### 8 Enterprise Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | **reconciliation_engine** | Multi-source data matching with configurable rules, discrepancy detection, and adjustment recommendations |
| 2 | **accrual_calculator** | Period-end accrual computation with straight-line, percentage, fixed, and usage-based methods |
| 3 | **contract_tracker** | Obligation monitoring, expiration alerts, renewal management, and risk scoring |
| 4 | **compliance_monitor** | Transaction screening against AML, sanctions, tax, trade, and data privacy regulations |
| 5 | **financial_reconciler** | Bank-to-ledger reconciliation with outstanding items detection and variance analysis |
| 6 | **workflow_automator** | Process definition with dependency analysis, automation metrics, and risk assessment |
| 7 | **data_consistency_checker** | Cross-dataset validation with completeness, uniqueness, range, and referential integrity checks |
| 8 | **approval_routing** | Dynamic approval path generation with SLA estimation and escalation management |

## Installation

```bash
npm install
npm run build
```

## Usage

Each tool accepts JSON-encoded parameters and returns formatted Markdown reports with emoji indicators, tables, and actionable outputs.

### Example: Reconciliation Engine

```typescript
const result = await tools.execute('reconciliation_engine', {
  source_data: JSON.stringify([{ id: 'S001', amount: 1500.00, date: '2024-12-01', description: 'Vendor Payment' }]),
  target_data: JSON.stringify([{ id: 'T001', amount: 1500.00, date: '2024-12-01', description: 'Vendor Payment' }]),
  match_rules: JSON.stringify([{ field: 'amount', tolerance: 0.01, weight: 2 }, { field: 'date', exact: true, weight: 1 }])
})
```

### Example: Accrual Calculator

```typescript
const result = await tools.execute('accrual_calculator', {
  period: '2024-12',
  expense_rules: JSON.stringify([{ category: 'payroll', accrual_method: 'straight_line', total_amount: 50000, recognized_to_date: 45000, start_date: '2024-12-01', end_date: '2024-12-31' }]),
  revenue_data: JSON.stringify([{ contract_id: 'C001', total_contract_value: 100000, performance_obligations: [{ obligation: 'Delivery', completed: true, value: 60000 }], billing_to_date: 40000 }])
})
```

### Example: Compliance Monitor

```typescript
const result = await tools.execute('compliance_monitor', {
  transactions: JSON.stringify([{ id: 'TXN001', date: '2024-12-15', amount: 50000, currency: 'USD', payer: 'ABC Corp', payee: 'XYZ Ltd', purpose: 'Consulting', country: 'US', category: 'services' }]),
  regulations: JSON.stringify([{ id: 'AML-001', name: 'AML Rule', type: 'aml', threshold: 10000, rules: ['File CTR above threshold'] }])
})
```

## Architecture

```
dsh-tool-erpagent/
├── package.json          # NPM config with MIT license
├── tsconfig.json         # TypeScript strict mode config
├── cordis.yml            # DSH plugin manifest
├── README.md             # This file
├── src/
│   └── index.ts          # All 8 tool implementations (~1500 lines)
└── lib/                  # Compiled output (after npm run build)
```

## Tool Specifications

### 1. Reconciliation Engine
- **Input:** source_data, target_data, match_rules
- **Output:** Match pairs, discrepancies, adjustment recommendations, match rate
- **Methods:** Field-weighted matching with configurable tolerances, confidence scoring

### 2. Accrual Calculator
- **Input:** period, expense_rules[], revenue_data[]
- **Output:** Accrual journal entries, period-end adjustments, revenue recognition
- **Methods:** Straight-line, percentage-of-completion, fixed, usage-based

### 3. Contract Tracker
- **Input:** contracts[], alert_rules
- **Output:** Alerts, obligation status, expiry calendar, risk summary
- **Features:** Auto-renewal detection, overdue tracking, value thresholds

### 4. Compliance Monitor
- **Input:** transactions[], regulations[]
- **Output:** Findings, compliance report, remediation plan
- **Coverage:** AML, sanctions, tax, trade compliance, data privacy

### 5. Financial Reconciler
- **Input:** bank_statements, ledger_entries, tolerance
- **Output:** Bank reconciliation statement, variance analysis, action items
- **Features:** Outstanding deposits/checks, bank charges, interest detection

### 6. Workflow Automator
- **Input:** process_name, process_steps[], triggers[], actions[]
- **Output:** Workflow config, execution plan, automation metrics, risk assessment
- **Features:** Topological sort, bottleneck identification, SLA estimation

### 7. Data Consistency Checker
- **Input:** datasets[], consistency_rules
- **Output:** Findings, consistency report, repair scripts (SQL)
- **Checks:** Completeness, uniqueness, range, referential integrity, format, cross-reference

### 8. Approval Routing
- **Input:** approval_request, org_hierarchy, routing_rules
- **Output:** Approval steps, SLAs, escalation paths, risk flags
- **Features:** Urgency-based SLA adjustment, parallel approval support

## Design Principles

- **Deterministic:** Seeded random number generation ensures reproducible outputs
- **Auditable:** All outputs include traceable logic and justification
- **Actionable:** Every finding includes recommended actions and responsible parties
- **Enterprise-Ready:** Structured reports suitable for management review and audit trails

## Dependencies

- `@deepseek-ai/cordis` ^4.0.1 — Core DSH framework
- `@deepseek-ai/dsh-tools` ^0.0.1-rc.1 — DSH tool definitions
- `typescript` ^5.0.0 — Build tooling

## License

MIT License. See LICENSE file for details.
