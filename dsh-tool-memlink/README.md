# dsh-tool-memlink

Cross-plugin memory correlation system for DeepSeek Harness (DSH). Provides intelligent memory linking across tools, semantic recall, memory decay analysis, conflict detection and resolution, and memory graph analysis.

## Features

- **Cross-tool memory linking** - Automatically discover relationships between memories from different plugins
- **Intelligent recall** - Semantic search with time-decay and importance weighting
- **Memory decay** - Track memory lifecycle, calculate half-life, detect stale entries
- **Conflict detection** - Identify contradictory memories and suggest resolutions
- **Memory compression** - Merge related memories into high-value summaries
- **Graph analysis** - Build node-edge graphs, community detection, centrality analysis
- **Audit reporting** - Health metrics: coverage, duplication, conflict rate, link density

## Tools

| Tool | Description |
|------|-------------|
| `memory_store` | Store a structured memory entry with metadata, tags, source tool, and importance level. Auto-links to related memories. |
| `memory_recall` | Intelligent recall with semantic search, time decay, importance weighting, and source filtering. |
| `memory_link` | Cross-tool memory linking: analyzes associations via shared tags, temporal proximity, content similarity. |
| `memory_decay_analysis` | Analyze memory lifecycle, calculate half-life, flag expired memories, suggest archival. |
| `memory_conflict_detect` | Detect contradictory memory entries and provide resolution recommendations. |
| `memory_compression` | Merge multiple related memories into high-value summaries to reduce token usage. |
| `memory_graph_build` | Build node-edge graph structure, support community discovery and centrality analysis. |
| `memory_audit_report` | Generate health report with coverage, duplication, conflict rate, decay status, link density. |

## Installation

```bash
cd dsh-tool-memlink
npm install
```

## Usage

Register the plugin in your DSH configuration. All 8 tools become available to the agent runtime.

```yaml
plugins:
  - dsh-tool-memlink
```

## Architecture

Built on Cordis dependency injection with strict TypeScript typing. All complex data is passed as JSON strings via tool parameters.
