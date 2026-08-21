# DSH Universal MCP Bridge

> The USB-C moment for AI tools — 186 DSH plugins (1488 tools) accessible from any MCP client.

`dsh-mcp-bridge` is a **Universal MCP Adapter** that exposes all 186 DeepSeek Harness (DSH) plugins — totaling **1,488 AI agent tools** — as MCP servers. This makes them instantly accessible from Claude Desktop, Cursor, VSCode, Windsurf, and any MCP-compatible client.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      MCP Clients                                │
│  Claude Desktop │ Cursor │ VSCode │ Windsurf │ Any MCP Client  │
└────────┬────────┴────┬────┴────┬────┴─────┬────┴──────┬────────┘
         │             │         │          │           │
         └─────────────┴─────────┴──────────┴───────────┘
                              │
                    Stateless HTTP / stdio
                    (No sessions, identity in headers)
                              │
              ┌───────────────┴───────────────┐
              │   dsh-universal-bridge v1.0.0 │
              │   MCP Server (this project)   │
              └───────────────┬───────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │ Auto-Discovery     │    Cost Tracker     │
         │ plugin-discovery.ts│    cost-tracker.ts  │
         └────────┬───────────┴──────────┬─────────┘
                  │                      │
    ┌─────────────┴──────────────┐       │
    │  186 DSH Plugins           │       │
    │  (1488 tools)              │       │
    │                            │       │
    │  carbontradingagent       │       │
    │  energyagentpro           │       │
    │  carbontradingagent       │       │
    │  mcphub                   │       │
    │  ... (182 more)           │       │
    └────────────────────────────┘       │
                                         │
                              ┌──────────┴──────────┐
                              │ Budget Governance   │
                              │ Warn at 80%         │
                              │ Block at 100%       │
                              └─────────────────────┘
```

## Quick Start

### 3 Commands

```bash
# 1. Install dependencies
cd mcp-bridge && npm install

# 2. Start the bridge (stdio mode)
npm start

# 3. Or start in watch mode for development
npm run dev
```

### Claude Desktop Setup

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dsh-universal-bridge": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "./mcp-bridge"
    }
  }
}
```

The `.mcp.json` file in this directory provides one-click configuration.

## Stateless Architecture

This server operates in **stateless mode** per the July 2026 MCP specification:

- **NO sessions** — Each request is self-contained
- **NO initialize handshake** — Tools are immediately available
- **Identity in headers** — Each request carries its own identity
- **Streamable HTTP** — Scalable through load balancers
- **Horizontally scalable** — No server-side state to synchronize

## All 186 Plugins (1488 Tools)

The bridge auto-discovers all `dsh-tool-*` directories. Each plugin's tools are exposed as individual MCP tools prefixed with the plugin name.

### Example Tool Names

| Plugin | Tool | MCP Tool Name |
|--------|------|---------------|
| carbontradingagent | carbon_price_predictor | `carbontradingagent.carbon_price_predictor` |
| carbontradingagent | offset_portfolio_optimizer | `carbontradingagent.offset_portfolio_optimizer` |
| energyagentpro | renewable_energy_optimizer | `energyagentpro.renewable_energy_optimizer` |
| mcphub | mcp_registry | `mcphub.mcp_registry` |

### Plugin Categories (186 total)

- **Enterprise Core (22)**: workflow, mcphub, agentguard, personalai, ragengine, promptlab, etc.
- **Finance & Compliance (16)**: cryptosignal, regulator, legalpro, complianceai, treasuryagent, etc.
- **Developer & Engineering (12)**: codereview, vibecoder, testengineer, apieco, etc.
- **Vertical Industries (18)**: medagent, healthai, realestate, manufacturex, etc.
- **Marketing & Sales (10)**: martech, ecomintel, influencerx, salesengine, etc.
- **Plus 108 additional industry-specific plugins**

## Usage

### Tool Invocation

Each tool accepts an `input_data` parameter containing a JSON-encoded string:

```json
{
  "name": "carbontradingagent.carbon_price_predictor",
  "arguments": {
    "input_data": "{\"market\": \"CN-ETS\", \"allowance_type\": \"CEA\", \"historical_prices\": [50, 52, 48, 55, 58, 60], \"forecast_periods\": 6}"
  }
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DSH_PLUGINS_ROOT` | `../` | Path to directory containing dsh-tool-* folders |
| `DSH_MCP_PORT` | `3000` | HTTP port (if HTTP transport is used) |
| `DSH_TRANSPORT` | `stdio` | Transport mode (`stdio` recommended) |
| `DSH_BUDGET` | `0` (unlimited) | Budget limit in USD |
| `DSH_WARN_THRESHOLD` | `0.8` | Warning threshold (80% of budget) |
| `DSH_BLOCK_THRESHOLD` | `1.0` | Block threshold (100% of budget) |
| `DSH_WATCH` | `false` | Enable hot-reload watch mode |

## Cost Governance

The bridge includes built-in token cost governance:

- **Token Estimation** — Rough heuristic based on input/output character size (4 chars/token)
- **Cost Estimation** — Based on $3/1M input tokens, $15/1M output tokens
- **Per-Plugin Aggregation** — Track costs per plugin
- **Budget Thresholds** — Warn at 80% usage, block at 100%
- **Cost Report** — Available as MCP resource at `dsh-bridge://cost-report`

## Project Structure

```
mcp-bridge/
├── package.json          # Dependencies: @modelcontextprotocol/sdk, zod
├── tsconfig.json         # ES2022, strict mode
├── .mcp.json             # MCP server config for Claude Desktop
├── README.md             # This file
└── src/
    ├── index.ts          # Main MCP server entry (stateless)
    ├── plugin-discovery.ts  # Auto-discovers all dsh-tool-* plugins
    ├── tool-adapter.ts   # Converts DSH defineTool to MCP schema
    ├── cost-tracker.ts   # Token/cost tracking per invocation
    └── types.ts          # Shared TypeScript types
```

## How It Works

1. **Discovery** — `plugin-discovery.ts` scans the parent directory for all `dsh-tool-*/cordis.yml` files, parsing each to extract plugin metadata and declared tools. For plugins using compact format, it falls back to source code extraction.

2. **Adaptation** — `tool-adapter.ts` converts each DSH `defineTool` into an MCP-compatible tool definition, prefixing tool names with the plugin name (e.g., `carbontradingagent.carbon_price_predictor`).

3. **Execution** — When a tool call arrives, the bridge dynamically imports the target plugin, creates a mock cordis context to capture tool registrations, and invokes the correct execute function.

4. **Cost Tracking** — Every invocation is recorded with estimated token counts and cost. Budget thresholds are enforced before execution.

## Tech Stack

- `@modelcontextprotocol/sdk` v1.30.0 — Latest MCP TypeScript SDK (v2 spec compatible)
- Stateless HTTP transport (July 2026 MCP spec)
- Zod v4 for schema validation
- Node.js 22+
- TypeScript 5.9+

## License

MIT
