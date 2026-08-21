# A2A Protocol Layer — DSH Plugin Toolkit

> Google A2A v1.0 (May 2026 GA) AgentCards for all 186 DSH plugins.

## What is A2A?

The **Agent-to-Agent (A2A) Protocol** is an open standard from Google that enables
independent AI agents to communicate, delegate tasks, and collaborate across vendor
boundaries. Each agent publishes a signed `AgentCard` at its `.well-known/agent.json`
endpoint, describing its identity, capabilities, authentication requirements, and the
skills (tools) it exposes.

## Why 186 Cards?

The DSH Plugin Toolkit contains **186 domain-specific plugins** — from agricultural
intelligence to cybersecurity, from HR analytics to maritime logistics. By wrapping
each plugin in an A2A AgentCard, any A2A-compliant client (Google ADK, LangGraph,
CrewAI, AutoGen, etc.) can discover and delegate to these agents without prior
integration.

## Directory Layout

```
a2a-cards/
├── generate.ts          # Auto-generator — scans cordis.yml + src/index.ts
├── schema.ts            # A2A AgentCard TypeScript interfaces
├── package.json         # Dependencies & scripts
├── README.md            # This file
└── cards/               # Generated AgentCard JSON files (185+ cards)
    ├── dsh-tool-a2abridge.json
    ├── dsh-tool-auditor.json
    ├── dsh-tool-agentguard.json
    └── ...
```

## Quick Start

```bash
cd a2a-cards
npm install
npm run generate      # Produces all AgentCard JSONs in cards/
npm run typecheck     # Type-check with tsc --noEmit
```

## AgentCard Structure

Each generated card follows the Google A2A v1.0 specification:

```jsonc
{
  "name": "dsh-tool-auditor",
  "description": "Agent audit - action logging, anomaly detection...",
  "url": "https://dsh-plugin-toolkit.dev/.well-known/agent.json/dsh-tool-auditor",
  "version": "0.1.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true,
    "delegation": false,
    "skillDiscovery": true
  },
  "authentication": { "schemes": ["bearer"] },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "action_logger",
      "name": "Action Logger",
      "description": "Create structured audit log entries...",
      "tags": ["auditor", "action", "logger"],
      "examples": [
        "Use Action Logger to create structured audit log entries...",
        "Can you run Action Logger? Log input is the main input I have.",
        "Invoke Action Logger with the relevant data..."
      ]
    }
    // ... 7 more skills
  ]
}
```

## How Generation Works

```
                   ┌──────────────────────────────┐
                   │   dsh-tool-xxx/cordis.yml     │
                   │   - id, name, version,        │
                   │     description, tools[]       │
                   └──────────────┬─────────────────┘
                                  │ parse
                                  ▼
                   ┌──────────────────────────────┐
                   │  CordisManifest (parsed)      │
                   └──────────────┬─────────────────┘
                                  │ enrich
                                  ▼
                   ┌──────────────────────────────┐
                   │  src/index.ts                 │
                   │  defineTool({ description })  │
                   └──────────────┬─────────────────┘
                                  │ extract
                                  ▼
                   ┌──────────────────────────────┐
                   │  ToolDescriptor[]             │
                   │  (id, name, description,      │
                   │   inputParams)                 │
                   └──────────────┬─────────────────┘
                                  │ build
                                  ▼
                   ┌──────────────────────────────┐
                   │  AgentCard (A2A v1.0)         │
                   │  cards/dsh-tool-xxx.json      │
                   └──────────────────────────────┘
```

## Example Inter-Agent Task Flow

```
Orchestrator Agent
        │
        │ -- discover -->  dsh-tool-auditor/.well-known/agent.json
        │ <--- AgentCard ---  (8 skills: action_logger, anomaly_detector, …)
        │
        │ -- submit task -->  Use anomaly_detector to scan agent "agent-42"
        │ <--- task status ---  working
        │ <--- stream SSE ---  { "deviation_score": 0.87, ... }
        │ <--- result ---      Anomaly report: 3 deviations detected
        │
        │ -- delegate -->  dsh-tool-complianceai  (next agent in chain)
        │                  ...
```

## Integration Guide

### 1. Import into an A2A Client

```typescript
import { A2AClient } from '@google-a2a/client'

const client = new A2AClient('https://dsh-plugin-toolkit.dev')
const card = await client.fetchAgentCard('dsh-tool-auditor')

console.log(card.skills.map(s => s.id))
// ['action_logger', 'anomaly_detector', 'compliance_checker', ...]
```

### 2. Add a New Plugin

Drop a `dsh-tool-newplugin/` with `cordis.yml` and `src/index.ts`
into the workspace, then re-run `npm run generate`. The new card
appears automatically in `cards/`.

### 3. Serve Cards

Deploy the `cards/` directory as static files so each plugin's
AgentCard is reachable at:

```
https://your-domain.com/.well-known/agent.json/<plugin-name>
```

## Notes

- One plugin (`dsh-tool-codereview`) currently has no `cordis.yml` and is skipped.
- Tool descriptions are extracted from `defineTool()` calls in `src/index.ts`.
- If source code is unavailable, a fallback description derived from the
  tool identifier is used.
