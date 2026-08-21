# DSH Plugin Toolkit

> **156 DeepSeek Harness plugins — 1248 AI agent tools**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek-Harness-orange.svg)](https://deepseek.com/)
[![156 Plugins](https://img.shields.io/badge/Plugins-156-8A2BE2.svg)](https://github.com/chengganping-ship-it/dsh-plugin-toolkit)

---

## Overview

A comprehensive plugin ecosystem for [DeepSeek Harness (DSH)](https://deepseek.com/) — the "Everything is a Plugin" AI Agent framework. 111 domain-specific plugins, each with 8 tools, covering enterprise operations, vertical industries, and personal productivity.

## Categories

| Category | Plugins | Tools |
|----------|---------|-------|
| Enterprise Core | 22 | 176 |
| Finance & Compliance | 16 | 128 |
| Developer & Engineering | 13 | 104 |
| Vertical Industries | 19 | 152 |
| Marketing & Sales | 10 | 80 |
| Personal Productivity | 8 | 64 |
| Security & Governance | 10 | 80 |
| Workforce & HR | 1 | 8 |
| IP Protection | 1 | 8 |
| Supply Chain Resilience | 1 | 8 |
| Multi-Agent Orchestration | 1 | 8 |
| Agent Memory Management | 1 | 8 |
| Agent Commerce | 1 | 8 |
| Governance & Security | 1 | 8 |
| Skills Marketplace | 1 | 8 |
| Physical AI / Robotics | 1 | 8 |
| GUI / UI Agent | 1 | 8 |
| Agent Factory | 1 | 8 |
| Legal AI | 1 | 8 |
| Healthcare AI | 1 | 8 |
| AI Education | 1 | 8 |
| FinTech AI | 1 | 8 |
| Smart Manufacturing | 1 | 8 |
| AI for Science | 1 | 8 |
| Vibe Coding | 1 | 8 |
| Smart Agriculture | 1 | 8 |
| Digital Government | 1 | 8 |
| Smart Retail | 1 | 8 |
| Autonomous Driving | 1 | 8 |
| Smart Energy | 1 | 8 |
| Smart Logistics | 1 | 8 |
| Cybersecurity | 1 | 8 |
| Gaming AI | 1 | 8 |
| Aerospace | 1 | 8 |
| Environmental | 1 | 8 |
| Insurance AI | 1 | 8 |
| Media & Content | 1 | 8 |
| Construction | 1 | 8 |
| Hospitality & Tourism | 1 | 8 |
| Chemical & Materials | 1 | 8 |
| AI Pharma | 1 | 8 |
| Telecom | 1 | 8 |
| Auto Aftermarket | 1 | 8 |
| Public Safety | 1 | 8 |
| Cultural Tourism | 1 | 8 |
| AI Recruitment | 1 | 8 |
| PR & Media Agent | 1 | 8 |
| Marketing AI | 1 | 8 |
| Customer Success | 1 | 8 |
| Food & Beverage | 1 | 8 |
| Mental Health AI | 1 | 8 |
| E-Commerce Ops | 1 | 8 |
| Smart Home | 1 | 8 |
| Creative Tools | 1 | 8 |
| GLP Compliance | 1 | 8 |
| Sports Intelligence | 1 | 8 |
| Fashion Tech | 1 | 8 |
| Carbon Trading | 1 | 8 |
| Smart Elderly Care | 1 | 8 |
| Aquaculture & Fisheries | 1 | 8 |
| Fleet Management | 1 | 8 |
| Smart Mining | 1 | 8 |
| Maritime Shipping | 1 | 8 |
| HR Compensation | 1 | 8 |
| Smart Forestry | 1 | 8 |

## Quick Start

```bash
# 1. Browse plugins
ls dsh-tool-*/    # List all plugins

# 2. Install dependencies
cd dsh-tool-workflow
npm install

# 3. Build
npm run build

# 4. (Optional) Publish to npm
npm login
npm publish
```

## Plugin Structure

Each plugin follows a consistent pattern:

```
dsh-tool-name/
├── package.json      # Dependencies & metadata
├── tsconfig.json     # TypeScript config
├── cordis.yml        # DSH plugin manifest
├── src/
│   └── index.ts      # Tool implementations (8 tools)
└── lib/              # Build output (gitignored)
```

## Marketplace Coverage

| Domain | Plugin | Key Tools |
|--------|--------|-----------|
| **Workflow Automation** | `workflow` | Designer, Executor, Monitor, Optimizer |
| **Cross-Platform Agents** | `a2abridge` | Registry, Router, Translator, Orchestrator |
| **MCP Protocol** | `mcphub` | Registry, Invoker, Composer, Monitor |
| **Personal AI Assistant** | `personalai` | Briefing, Inbox, Meetings, Focus |
| **AI Agent Security** | `agentguard` | Audit, Permissions, Anomaly, Compliance |
| **AIOps** | `opsinsight` | Alert Fusion, Root Cause, Remediation |
| **Customer Service** | `supportgenius` | Channel, Intent, Router, Sentiment |
| **Financial Treasury** | `treasuryagent` | Cash, Liquidity, Payments, FX |
| **Legal eDiscovery** | `legaldiscovery` | Collection, Review, Redaction |
| **Healthcare RCM** | `healthrcm` | Eligibility, Coding, Billing, Denials |
| **ESG Sustainability** | `esgengine` | Carbon, Reporting, Supply Chain |
| **Knowledge Graph** | `kgpro` | Ontology, Entity, Search, Reasoning |
| **Contract Lifecycle** | `clmengine` | Author, Negotiate, Obligations, Renewal |
| **Customer Data** | `cdpagent` | Profile, Segment, Journey, Activation |
| **HR & Talent** | `peoplex` | Skills, Forecast, Recruiter, Wellbeing |
| **Research Acceleration** | `researchos` | Literature, Hypothesis, Experiment |
| **Cloud Operations** | `cloudops` | Cost, K8s, Reliability, Carbon |
| **Spreadsheet AI** | `spreadsheet` | Formula, Cleaner, Pivot, Charts |
| **B2B Sales** | `salesengine` | Leads, Outreach, Deals, Forecast |

> Full plugin list: see [PLUGINS.md](PLUGINS.md)

## Tech Stack

- **TypeScript 5.0+** with strict mode
- **DeepSeek Harness (Cordis)** dependency injection
- **DSH Tools** (`defineTool` API)
- Each plugin compiles independently via `tsc`
- 100% deterministic output via seeded PRNG

## Repository Stats

- **156 plugins** × **8 tools** each = **1248 tool implementations**
- **100% TypeScript strict** — zero compilation errors
- **MIT Licensed**
- **Wave 31 (2026-08)**: fleetagentpro + mineaiagent + maritimeagent + hrcompagent + forestagentpro
- **Wave 30 (2026-08)**: sportagentpro + fashiontechagent + carbontradingagent + agedcareagent + aquafishagent
- **Wave 29 (2026-08)**: mentalhealthagentpro + ecomagentpro + smarthomeagent + creativeagentpro + glpcomplianceagent
- **Wave 28 (2026-08)**: recruitagentpro + pragentpro + marketingagentpro + csagentpro + foodagentpro
- **Wave 27 (2026-08)**: pharmaaiagent + telecomaiagent + autoafteragent + safetyagentpro + cultouragent

## License

[MIT](LICENSE) © 2025 chengganping-ship-it
