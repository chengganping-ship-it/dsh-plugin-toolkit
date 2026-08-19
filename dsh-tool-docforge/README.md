# dsh-tool-docforge

Real-time Documentation Injection Engine for DeepSeek Harness (DSH).

Evolved from Context7-style real-time docs injection, DocForge adds multi-source aggregation, version diff tracking, document quality scoring, and automatic sync capabilities.

## Features

- **Multi-source aggregation**: Collect and unify documentation from official docs, GitHub README, StackOverflow, changelogs, and npm registry
- **Version diff tracking**: Compare documentation between library versions to surface breaking changes, deprecations, and new APIs
- **Quality scoring**: Rate documentation completeness, accuracy, clarity, example coverage, and freshness with A-F grades
- **Auto sync**: Monitor cached documentation staleness against upstream and prioritize updates
- **API extraction**: Build structured API indexes with full signatures, parameters, return types, and examples
- **Source comparison**: Cross-reference multiple sources for the same API to find inconsistencies and determine reliability
- **Deprecation tracking**: Scan for deprecated notices, build timelines, and provide migration guidance
- **Injection planning**: Generate optimal doc injection strategies based on project dependency analysis

## Tools

| Tool | Description |
|------|-------------|
| `doc_aggregate` | Aggregate documentation from multiple sources |
| `doc_version_diff` | Compare docs between versions |
| `doc_quality_score` | Evaluate documentation quality |
| `doc_sync_status` | Check cached doc freshness |
| `doc_extract_api` | Extract structured API signatures |
| `doc_compare_sources` | Cross-reference sources for consistency |
| `doc_deprecation_track` | Track deprecations and migrations |
| `doc_injection_plan` | Generate optimal injection strategy |

## Installation

```bash
npm install dsh-tool-docforge
```

Add to your DSH plugin configuration or let Cordis auto-discover via `cordis.yml`.

## Usage

Once loaded by DSH, all 8 tools become available to the agent. Each tool accepts a JSON string parameter and returns a formatted markdown report.

Example:

```typescript
// Aggregate docs for React 18 from official and GitHub sources
{
  "target_library": JSON.stringify({
    "name": "react",
    "version": "18.2.0",
    "sources": ["official", "github"],
    "topics": ["hooks", "components"]
  })
}
```

## Configuration

The `cordis.yml` file declares the plugin identity, version, and tool manifest. No additional configuration is required for basic operation.

## License

MIT
